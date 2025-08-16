import { ActivityType } from 'discord.js'
import { client } from 'robo.js'

/**
 * This event handler will be called when your Robo is logged in and ready.
 * You can get `client` from `robo.js` directly or as a parameter in `ready` events.
 *
 * Learn more about Discord events:
 * https://robojs.dev/discord-bots/events
 */
export default async () => {
	client.user?.setPresence({
		status: 'idle',
		activities: [
			{
				name: 'hi guys',
				type: ActivityType.Custom,
			},
			{
			name: 'you, probably...',
			type: ActivityType.Watching,
		  },
			{
				name: 'with your sigma commands',
				type: ActivityType.Playing,
			},
			{
				name: 'kz',
				type: ActivityType.Listening,
			}
		]
	})
}
