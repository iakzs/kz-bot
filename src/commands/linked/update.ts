import { createCommandConfig, logger } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'
import { updateMetadata } from '../../utils/discord'

export const config = createCommandConfig({
	description: "update your linked roles",
	options: [
		{
			type: 'user',
			name: 'user',
			description: 'the user to update',
			required: true
		}
	]
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply({ ephemeral: true })
	logger.info(`Role update requested by ${interaction.user.tag}`)

	try {
		const target = interaction.options.getUser('user')
		if (!target) {
			return await interaction.editReply('no user specified')
		}
		await updateMetadata(target.id)
		await interaction.editReply(`${target}'s linked roles have been updated!`)
	} catch (error) {
		logger.error(`Error updating roles: ${error}`)
		await interaction.editReply('failed to update roles. please try the oauth flow first.')
	}
}
