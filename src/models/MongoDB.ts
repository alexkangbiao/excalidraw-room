import mongoose from 'mongoose';
import { config } from 'dotenv';


export default class MongoDB {
	
	static connect() {	
		config();
		const databaseUri: string = process.env.MONGOOSE_URI || 'mongodb://10.21.4.103:27017/whiteboard';
		mongoose.connect(databaseUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		})
		.then(() => console.log("MongoDB Connection Successful", databaseUri))
			.catch((err) => {
				console.log("MongoDB Connection Fail",  databaseUri);
				console.log(err);
			});	
	}

	static disconnect() {
		mongoose.connection.close();	
	}
	
}




