import type { RoboRequest, RoboReply } from '@robojs/server';
import * as storage from '../utils/storage';

export default async (request: RoboRequest, reply: RoboReply) => {
	if (request.method !== 'GET') {
		return reply.code(405).send('method not allowed');
	}

	const userId = request.query.userId as string;
	if (!userId) {
		return reply.code(400).send({ verified: false, error: 'missing userId parameter' });
	}

	try {
		const tokens = await storage.getDiscordTokens(userId);

		return {
			verified: !!tokens,
			userId: userId
		};
	} catch (error) {
		console.error('Error checking verification status:', error);
		return reply.code(500).send({ verified: false, error: 'internal server error' });
	}
};
