import type { RoboRequest, RoboReply } from '@robojs/server';
import { updateMetadata } from '../utils/discord';

export default async (request: RoboRequest, reply: RoboReply) => {
	if (request.method !== 'POST') {
		return reply.code(405).send('method not allowed');
	}

	try {
		const body = await request.json() as { userId: string };
		const userId = body.userId;

		if (!userId) {
			return reply.code(400).send('missing userId parameter');
		}

		await updateMetadata(userId);
		return reply.code(204).send(204);
	} catch (error) {
		console.error('Metadata update error:', error);
		return reply.code(500).send('failed to update metadata');
	}
};
