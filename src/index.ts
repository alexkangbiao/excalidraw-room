import debug from "debug";
import express, { Application, Request, Response, NextFunction } from "express";
import https from "https";
import socketIO from "socket.io";
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import MongoDB from './models/MongoDB';
import WhiteboardController, { IWhiteboardData, IWhiteboardPayload } from "./controllers/WhiteboardController";
import { Status } from "./controllers/common";

config();

// for connect to mongo database
MongoDB.connect();

var fs = require('fs');

var privateKey  = fs.readFileSync('crt/private.pem', 'utf8');
var certificate = fs.readFileSync('crt/file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

const serverDebug = debug("server");
const ioDebug = debug("io");
const socketDebug = debug("socket");

const app: Application = express();
const port = process.env.PORT || 8101; // default port to listen

// app.use(express.static('client/build'));
const allowCrossDomain =  (req: Request, res: Response, next: any) => {
  res.header('Access-Control-Allow-Origin', 'https://chinapandi.com');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials','true');
  next();
};

app.use(allowCrossDomain);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw());

app.get("/", (req, res) => {
  res.send("ExcalidrawTest collaboration server is up :)");
});



app.post(
	'/api/data/save-data',
	async (req: Request, res: Response): Promise<void> => {
		const whiteboard: IWhiteboardData = req.body;
		const payload: IWhiteboardPayload = await WhiteboardController.createWhiteboard(whiteboard);
		if (payload.status == Status.DATA_NOT_FOUND || (payload.status == Status.DATA_FOUND && payload.whiteboard)) {
			res.json({
        message: payload.whiteboard,
			});
		} else if (payload.status == Status.ERROR)
			res.json({
				message: 'Error',
			});
	}
);

app.post(
  '/api/data/get-data', 
  async (req: Request, res: Response): Promise<void> => {
    const id = req.body.id;
    const payload: IWhiteboardPayload = await WhiteboardController.findWhiteboard(id);
    if (payload.status == Status.DATA_FOUND && payload.whiteboard) {
      res.json({
        message: payload.whiteboard,
      });
    } else if (payload.status == Status.DATA_NOT_FOUND){
      res.json({
        message: Status.DATA_NOT_FOUND,
      });
    } else if (payload.status == Status.ERROR)
      res.json({
        message: 'Error',
      });
});

app.post(
  '/api/data/delete-data', 
  async (req: Request, res: Response): Promise<void> => {
    const id = req.body.id;
    const payload: IWhiteboardPayload = await WhiteboardController.deleteWhiteboard(id);
    if (payload.status == Status.DATA_DELETED && payload.whiteboard) {
      res.json({
        message: payload.whiteboard,
      });
    } else if (payload.status == Status.DATA_NOT_FOUND){
      res.json({
        message: Status.DATA_NOT_FOUND,
      });
    } else if (payload.status == Status.ERROR)
      res.json({
        message: 'Error',
      });
});

app.get("/version", (req: Request, res: Response): void => {
	res.send("Version: 1.0 !");
});

// const server = http.createServer(app);
const server = https.createServer(credentials, app);

server.listen(port, () => {
  serverDebug(`listening on port: ${port}`);
});

const io = socketIO(server, {
  handlePreflightRequest: function (req, res) {
    var headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin":
        (req.header && req.header.origin) || "https://chinapandi.com",
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});

io.on("connection", (socket) => {
  ioDebug("connection established!");

  io.to(`${socket.id}`).emit("init-room");
  socket.on("join-room", (roomID) => {
    socketDebug(`${socket.id} has joined ${roomID}`);
    socket.join(roomID);
    if (io.sockets.adapter.rooms[roomID].length <= 1) {
      io.to(`${socket.id}`).emit("first-in-room");
    } else {
      socket.broadcast.to(roomID).emit("new-user", socket.id);
    }
    io.in(roomID).emit(
      "room-user-change",
      Object.keys(io.sockets.adapter.rooms[roomID].sockets)
    );
  });

  socket.on(
    "server-broadcast",
    (roomID: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
      socketDebug(`${socket.id} sends update to ${roomID}`);
      socket.broadcast.to(roomID).emit("client-broadcast", encryptedData, iv);
    }
  );

  socket.on(
    "server-volatile-broadcast",
    (roomID: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
      socketDebug(`${socket.id} sends volatile update to ${roomID}`);
      socket.volatile.broadcast
        .to(roomID)
        .emit("client-broadcast", encryptedData, iv);
    }
  );

  socket.on("disconnecting", () => {
    const rooms = io.sockets.adapter.rooms;
    for (const roomID in socket.rooms) {
      const clients = Object.keys(rooms[roomID].sockets).filter(
        (id) => id !== socket.id
      );
      if (clients.length > 0) {
        socket.broadcast.to(roomID).emit("room-user-change", clients);
      }
    }
  });

  socket.on("disconnect", () => {
    socket.removeAllListeners();
  });

  // for media (Video and Audio)
  // when a new user join room
 
});



// module.exports = app;

