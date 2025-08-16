import { createCommandConfig, logger, Robo } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'

export const config = createCommandConfig({
	description: "kz-bot gets restarted real"
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply()
	logger.info(`kz-only restart command used by ${interaction.user.tag}`)
	if (interaction.user.id == '622795838032314388') {
		await interaction.editReply('restarted..')
		Robo.restart()
	} else {
		await interaction.editReply(`no restart from you :pensive:`)
	}
}
