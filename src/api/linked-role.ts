import type { RoboRequest, RoboReply } from '@robojs/server';
import { getOAuthUrl } from '../utils/discord.js';
import { storeState } from '../utils/stateStore';

export default (request: RoboRequest, reply: RoboReply) => {
	const { url, state } = getOAuthUrl();

	console.log('Redirecting to Discord with state:', state);

	storeState(state);

	return reply
		.code(302)
		.header('Location', url)
		.send("go to " + url + " to continue... the redirect isnt working vro...");
};
