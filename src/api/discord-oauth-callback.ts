import type { RoboRequest, RoboReply } from '@robojs/server';
import { getOAuthTokens, getUserData, pushMetadata } from '../utils/discord.js';
import * as storage from '../utils/storage.js';
import { verifyState } from '../utils/stateStore';
import config from '../utils/config.js';

export default async (request: RoboRequest, reply: RoboReply) => {
	console.log('Callback received with params:', request.query);

	try {
		const { code, state } = request.query;

		if (!code || !state) {
			return reply.code(400).send('Missing code or state parameter');
		}

		console.log('State from query:', state);

		if (!verifyState(Array.isArray(state) ? state[0] : state)) {
			console.error('invalid or expired state!');
			return reply.code(400).send('invalid or expired state');
		}

		const tokens = await getOAuthTokens(Array.isArray(code) ? code[0] : code);
		console.log('Got tokens:', Object.keys(tokens));

		tokens.expires_at = Date.now() + tokens.expires_in * 1000;

		const userData = await getUserData(tokens);
		console.log('User data received:', userData.user.id);

		await storage.storeDiscordTokens(userData.user.id, tokens);

		// me when enviroment variables?!?!!?
		const KZ_USER_ID = '622795838032314388';
		const KZ_GF_USER_ID = process.env.KZ_GF_USER_ID; // no hardwriting, kz!

		const isKZ = userData.user.id === KZ_USER_ID;
		const isKZGF = userData.user.id === KZ_GF_USER_ID;

		console.log(`User ID: ${userData.user.id}`);
		console.log(`KZ User ID: ${KZ_USER_ID}`);
		console.log(`KZ GF User ID: ${KZ_GF_USER_ID}`);
		console.log(`Is KZ: ${isKZ}`);
		console.log(`Is KZ's GF: ${isKZGF}`);

		await pushMetadata(userData.user.id, tokens, {
			is_kz: isKZ ? 1 : 0,
			is_kzs_bf: isKZGF ? 1 : 0
		});

		console.log(`Pushed metadata to Discord: is_kz=${isKZ}, is_kz_gf=${isKZGF}`);

		// ts html does NOT work at all
		return reply
			.code(200)
			.send(`
         authorization successful
         your Discord account has been linked successfully!
         ${userData.user.username}
         you are: ${isKZ ? 'kz verified ✅' : isKZGF ? 'kz\'s girlfriend verified ✅' : 'not kz or kz\'s girlfriend ❌'}
 				 you can now close ts window and return to Discord rea
      `);

	} catch (error) {
		console.error('OAuth callback error:', error);
		return reply.code(500).send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
};
