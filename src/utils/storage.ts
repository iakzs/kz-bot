interface TokenData {
	access_token: string;
	refresh_token: string;
	expires_at: number;
}

const store = new Map<string, TokenData>();

export async function storeDiscordTokens(userId: string, tokens: TokenData): Promise<void> {
	await store.set(`discord-${userId}`, tokens);
}

export async function getDiscordTokens(userId: string): Promise<TokenData | undefined> {
	return store.get(`discord-${userId}`);
}
