import crypto from 'crypto'

import * as storage from './storage.js'
import config from './config.js'

export function getOAuthUrl(): { state: string, url: string } {
	const state = crypto.randomUUID();

	const url = new URL('https://discord.com/api/oauth2/authorize');
	url.searchParams.set('client_id', config.DISCORD_CLIENT_ID);
	url.searchParams.set('redirect_uri', config.DISCORD_REDIRECT_URI);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('state', state);

	url.searchParams.set('scope', 'identify role_connections.write');

	url.searchParams.set('prompt', 'consent');
	return { state, url: url.toString() };
}

interface OAuthTokens {
	access_token: string
	refresh_token: string
	expires_in: number
	expires_at: number
}

export async function getOAuthTokens(code: string): Promise<OAuthTokens> {
	const url = 'https://discord.com/api/v10/oauth2/token'
	const body = new URLSearchParams({
		client_id: config.DISCORD_CLIENT_ID,
		client_secret: config.DISCORD_CLIENT_SECRET,
		grant_type: 'authorization_code',
		code,
		redirect_uri: config.DISCORD_REDIRECT_URI
	})

	const response = await fetch(url, {
		body,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})

	if (response.ok) {
		const data = await response.json() as Omit<OAuthTokens, 'expires_at'>
		return {
			...data,
			expires_at: Date.now() + data.expires_in * 1000
		}
	} else {
		throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`)
	}
}

export async function getAccessToken(userId: string, tokens: OAuthTokens): Promise<string> {
	if (tokens.expires_at && Date.now() > tokens.expires_at) {
		const url = 'https://discord.com/api/v10/oauth2/token'
		const body = new URLSearchParams({
			client_id: config.DISCORD_CLIENT_ID,
			client_secret: config.DISCORD_CLIENT_SECRET,
			grant_type: 'refresh_token',
			refresh_token: tokens.refresh_token
		})

		const response = await fetch(url, {
			body,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})

		if (response.ok) {
			const newTokens = (await response.json()) as OAuthTokens
			newTokens.expires_at = Date.now() + newTokens.expires_in * 1000
			await storage.storeDiscordTokens(userId, newTokens)
			return newTokens.access_token
		} else {
			throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`)
		}
	}
	return tokens.access_token
}

export async function getUserData(tokens: OAuthTokens): Promise<any> {
	const url = 'https://discord.com/api/v10/oauth2/@me'
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${tokens.access_token}`
		}
	})

	if (response.ok) {
		const data = await response.json()
		return data
	} else {
		throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`)
	}
}

interface UserMetadata {
	is_kz: number
	is_kzs_bf: number // 0 or 1
}

export async function pushMetadata(userId: string, tokens: OAuthTokens, metadata: UserMetadata): Promise<void> {
	const url = `https://discord.com/api/v10/users/@me/applications/${config.DISCORD_CLIENT_ID}/role-connection`
	const accessToken = await getAccessToken(userId, tokens)
	const body = {
		platform_name: 'kz-bot',
		metadata
	}

	const response = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify(body),
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	})

	if (!response.ok) {
		throw new Error(`Error pushing discord metadata: [${response.status}] ${response.statusText}`)
	}
}

export async function getMetadata(userId: string, tokens: OAuthTokens): Promise<any> {
	const url = `https://discord.com/api/v10/users/@me/applications/${config.DISCORD_CLIENT_ID}/role-connection`
	const accessToken = await getAccessToken(userId, tokens)

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})

	if (response.ok) {
		const data = await response.json()
		return data
	} else {
		throw new Error(`Error getting discord metadata: [${response.status}] ${response.statusText}`)
	}
}

export async function updateMetadata(userId: string): Promise<void> {
	const tokens = await storage.getDiscordTokens(userId);
	if (!tokens) {
		throw new Error(`No tokens found for user ${userId}`);
	}

	const metadata = {
		is_kz: userId === config.KZ_USER_ID ? 1 : 0,
		is_kzs_bf: userId === config.KZ_GF_USER_ID ? 1 : 0
	};

	const oauthTokens: OAuthTokens = {
		...tokens,
		expires_in: tokens.expires_at ? Math.floor((tokens.expires_at - Date.now()) / 1000) : 0
	};

	await pushMetadata(userId, oauthTokens, metadata);
}

