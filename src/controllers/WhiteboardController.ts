import Whiteboard, { IWhiteboard } from '../models/Whiteboard';

export enum Status {
	DATA_FOUND = 'DATA_FOUND',
	DATA_NOT_FOUND = 'DATA_NOT_FOUND',
	DATA_UPDATED = 'DATA_UPDATED',
	DATA_DELETED = 'DATA_DELETED',
	ERROR = 'ERROR',
}

export interface IWhiteboardPayload {
	Whiteboard: IWhiteboard | null;
	status: Status;
}

export interface IWhiteboardData {
	id: string;
	data: string;
}

export default class WhiteboardController {

	static async createWhiteboard(data: IWhiteboardData): Promise<IWhiteboardPayload> {
		let newWhiteboard: IWhiteboard | null = null;
		let status: Status = Status.DATA_NOT_FOUND;

		await Whiteboard.findOne(
			{ id: data.id },
			(err: any, Whiteboard: IWhiteboard | null): void => {
				if (err) status = Status.ERROR;
				if (Whiteboard) {
					newWhiteboard = Whiteboard;
					status = Status.DATA_FOUND;
				}
			}
		);

		if (status == Status.DATA_NOT_FOUND) {
			newWhiteboard = new Whiteboard();
			newWhiteboard.id = data.id;
			newWhiteboard.data = data.data;
			newWhiteboard.insertTime = new Date();
			newWhiteboard.updateTime = new Date();
			await newWhiteboard.save();
		}

		return { Whiteboard: newWhiteboard, status };
	}

	static async findWhiteboard(id: string): Promise<IWhiteboardPayload> {
		let foundWhiteboard: IWhiteboard | null = null;
		let status: Status = Status.DATA_FOUND;

		await Whiteboard.findOne(
			{ id: id },
			(err: any, whiteboard: IWhiteboard | null): void => {
				if (err) status = Status.ERROR;
				if (whiteboard) 
					foundWhiteboard = whiteboard;
				else 
					status = Status.DATA_NOT_FOUND;
			}
		);

		return { Whiteboard: foundWhiteboard, status };
	}

	static async updateWhiteboard(
		id: string,
		newData: string
	): Promise<IWhiteboardPayload> {
		let newWhiteboard: IWhiteboard | null = null;
		let status = Status.DATA_UPDATED;

		await Whiteboard.findOneAndUpdate(
			{ id: id },
			{ data: newData, updateTime: new Date() },
			{ new: true },
			(err: any, whiteboard: IWhiteboard | null): void => {
				if (err) status = Status.ERROR;
				if (whiteboard) newWhiteboard = whiteboard;
				else status = Status.DATA_NOT_FOUND;
			}
		);
		return { Whiteboard: newWhiteboard, status };
	}

	static async deleteWhiteboard(id: string): Promise<IWhiteboardPayload> {
		let deletedWhiteboard: IWhiteboard | null = null;
		let status = Status.DATA_DELETED;

		await Whiteboard.findOneAndDelete(
			{ id: id },
			{},
			(err: any, whiteboard: IWhiteboard | null): void => {
				if (err)
					status = Status.ERROR;
				if (whiteboard)
					deletedWhiteboard = whiteboard;

				else
					status = Status.DATA_NOT_FOUND;
			}
		);
		return { Whiteboard: deletedWhiteboard, status };
	}
}
