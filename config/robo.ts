import type { Config } from 'robo.js'

export default <Config>{
	clientOptions: {
		intents: ['Guilds', 'GuildMessages']
	},
	plugins: [],
	type: 'robo',
	defaults: {
		contexts: ['Guild', 'BotDM', 'PrivateChannel'],
		help: false,
		dev: false,
		integrationTypes: ['GuildInstall', 'UserInstall']
	}
}
