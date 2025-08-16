import type { RoboRequest, RoboReply } from '@robojs/server';

export default (request: RoboRequest, reply: RoboReply) => {
	console.log('Redirecting to linked-role endpoint');

	const redirectUrl = 'https://kz-bot.iakzs.lol/api/linked-role';

	return reply
		.code(302)
		.header('Location', redirectUrl)
		.send("go to " + redirectUrl + " to verify... the redirect isnt working vro...");
};
