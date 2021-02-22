import WhiteboardController, {
	Status,
	IWhiteboardPayload,
} from '../controllers/WhiteboardController';
import MongoDB from '../models/MongoDB';

MongoDB.connect();

test('Creating a Whiteboard', async (): Promise<void> => {
	const payload: IWhiteboardPayload = await WhiteboardController.createWhiteboard({
		id: 'DATAtestmail123@testmail.com',
		data: 'testpass',
	});

	if (payload.status == Status.DATA_NOT_FOUND && payload.Whiteboard) {
		expect(payload.Whiteboard.id).toBe('DATAtestmail123@testmail.com');
		expect(payload.Whiteboard.data).toBe('testpass');
	}
});

test('Finding a Whiteboard', async (): Promise<void> => {
	const payload: IWhiteboardPayload = await WhiteboardController.findWhiteboard(
		'DATAtestmail123@testmail.com'
	);

	expect(payload.status).toBe(Status.DATA_FOUND);
});

test('Updating a Whiteboard', async (): Promise<void> => {
	const payload: IWhiteboardPayload = await WhiteboardController.updateWhiteboard(
		'DATAtestmail123@testmail.com',
		'testpass2'
	);

	expect(payload.status).toBe(Status.DATA_UPDATED);
});

test('Deleting a Whiteboard', async (): Promise<void> => {
	const payload: IWhiteboardPayload = await WhiteboardController.deleteWhiteboard(
		'DATAtestmail123@testmail.com'
	);

	expect(payload.status).toBe(Status.DATA_DELETED);
});

afterAll(async (): Promise<void> => await MongoDB.disconnect());
