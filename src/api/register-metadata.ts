import type { RoboRequest, RoboReply } from '@robojs/server';
import registerMetadata from '../utils/register';

export default async (request: RoboRequest, reply: RoboReply) => {
	if (request.method !== 'POST') {
		return reply.code(405).send('method not allowed');
	}

	try {
		const result = await registerMetadata();
		return reply.send({ success: true, data: result });
	} catch (error) {
		console.error('Registration error:', error);
		return reply.code(500).send('failed to register metadata schema with Discord');
	}
};
