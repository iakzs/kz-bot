/**
 * Configuration values loaded from environment variables
 */
const config = {
	DISCORD_TOKEN: process.env.DISCORD_TOKEN,
	DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
	COOKIE_SECRET: process.env.COOKIE_SECRET,
	KZ_USER_ID: process.env.KZ_USER_ID || '622795838032314388',
	KZ_GF_USER_ID: process.env.KZ_GF_USER_ID,
};

export default config;
