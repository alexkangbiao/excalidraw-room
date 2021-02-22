import  { Schema, Document, Model, model } from 'mongoose';

export interface IWhiteboard extends Document {
	id: string;
	insertTime: Date;
	data: string;
	updateTime: Date;
}

export const WhiteboarSchema: Schema = new Schema({
	id: { type: String, required: true, unique: true },
	insertTime: { type: Date, required: true },
	updateTime: { type: Date, required: true },
	data: { type: String, required: true },
});

const Whiteboard: Model<IWhiteboard> = model<IWhiteboard>('Whiteboard', WhiteboarSchema);

export default Whiteboard;
