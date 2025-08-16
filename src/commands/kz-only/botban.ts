import { createCommandConfig, logger, Flashcore } from 'robo.js'
import { ChatInputCommandInteraction } from 'discord.js'

export const config = createCommandConfig({
	description: "kz-bot bans or unbans a user from the bot",
	options: [
		{
			name: 'action',
			description: 'ban or unban the user',
			type: 'string',
			required: true,
			choices: [
				{ name: 'ban', value: 'ban' },
				{ name: 'unban', value: 'unban' }
			]
		},
		{
			name: 'user_identifier',
			description: 'user ID or username to ban/unban (e.g., epicusername)',
			type: 'string',
			required: true
		}
	]
} as const)

const ADMIN_USER_ID = '622795838032314388'

export default async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply()
	logger.info(`botban command used by ${interaction.user.tag}`)

	if (interaction.user.id !== ADMIN_USER_ID) {
		logger.warn(`Unauthorized botban attempt by ${interaction.user.tag}`)
		return interaction.editReply('you are not allowed to use this command.')
	}

	const action = interaction.options.getString('action', true)
	const userIdentifier = interaction.options.getString('user_identifier', true)
	let bans = (await Flashcore.get<Record<string, string>>('bans')) || {}

	if (action === 'ban') {
		if (bans[userIdentifier]) {
			return interaction.editReply(`${userIdentifier} is already banned.`)
		}

		bans[userIdentifier] = userIdentifier
		await Flashcore.set('bans', bans)

		logger.info(`User ${userIdentifier} was banned by ${interaction.user.tag}`)
		return interaction.editReply(`user ${userIdentifier} has been banned.`)
	} else if (action === 'unban') {
		if (!bans[userIdentifier]) {
			return interaction.editReply(`${userIdentifier} is not banned.`)
		}

		delete bans[userIdentifier]
		await Flashcore.set('bans', bans)

		logger.info(`User ${userIdentifier} was unbanned by ${interaction.user.tag}`)
		return interaction.editReply(`user ${userIdentifier} has been unbanned.`)
	} else {
		return interaction.editReply('invalid action. Use "ban" or "unban".')
	}
}