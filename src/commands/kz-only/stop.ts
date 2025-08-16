import { createCommandConfig, logger, Robo } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'

export const config = createCommandConfig({
	description: "kz-bot gets stopped real"
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply()
	logger.info(`kz-only restart command used by ${interaction.user.tag}`)
	if (interaction.user.id == '622795838032314388') {
		await interaction.editReply('stopped..')
		Robo.stop()
	} else {
		await interaction.editReply(`no stop from you :pensive:`)
	}
}
