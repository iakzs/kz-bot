import { createCommandConfig, Flashcore, logger } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'

export const config = createCommandConfig({
	description: "kz-bot's epic ping real"
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
	logger.info(`ping command used by ${interaction.user.tag}`)

	const bans = (await Flashcore.get<Record<string, string>>('bans')) || {}

	if (bans[interaction.user.id] || bans[interaction.user.tag]) {
		logger.warn(`Banned user ${interaction.user.tag} tried to use ping command`)
		return interaction.reply('you are banned from using kz-bot.')
	}

	const sent = await interaction.reply({ content: 'Pong!', fetchReply: true })
	const latency = sent.createdTimestamp - interaction.createdTimestamp
	const apiLatency = interaction.client.ws.ping

	await interaction.editReply(`Pong! 🏓\nLatency: ${latency}ms\nAPI Latency: ${apiLatency}ms`)
}

