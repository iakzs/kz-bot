export {}
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_OPTIONS: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_TOKEN: string;
			AIKEY: string; // not in use as i deleted AI from this
      PORT: string;
			R2_ACCOUNT_ID: string;
			R2_ACCESS_KEY_ID: string;
			R2_SECRET_ACCESS_KEY: string;
			R2_BUCKET_NAME: string;
			DISCORD_REDIRECT_URI: string;
			DISCORD_CLIENT_SECRET: string;
			COOKIE_SECRET: string;
			KZ_USER_ID: string,
			KZ_GF_USER_ID: string,
    }
  }
}
