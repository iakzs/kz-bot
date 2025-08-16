import { createCommandConfig, logger } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'

export const config = createCommandConfig({
	description: "kz-bot says hi to kz real"
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply()
	logger.info(`kz-only hi command used by ${interaction.user.tag}`)
	if (interaction.user.id == '622795838032314388') {
		await interaction.editReply('hello vro..')
	} else {
		await interaction.editReply(`no hi to you :pensive:`)
	}
}
