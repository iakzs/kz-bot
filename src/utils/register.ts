import config from './config.js';

async function registerMetadata() {
	const url = `https://discord.com/api/v10/applications/${config.DISCORD_CLIENT_ID}/role-connections/metadata`;

	const body = [
		{
			key: 'is_kz',
			name: 'Is kz',
			description: 'Checks if the user is kz',
			type: 7,
		},
		{
			key: 'is_kzs_bf',
			name: 'Is the one and only kzs gf',
			description: 'Checks if the user is the one and only kzs girlfriend',
			type: 7,
		}
	];

	const response = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bot ${config.DISCORD_TOKEN}`,
		},
	});

	if (response.ok) {
		const data = await response.json();
		console.log('Metadata schema registered successfully:', data);
		return data;
	} else {
		const errorText = await response.text();
		console.error('Failed to register metadata schema:', errorText);
		throw new Error(`Error registering metadata schema: [${response.status}] ${response.statusText}`);
	}
}

registerMetadata().catch(console.error);

export default registerMetadata;
