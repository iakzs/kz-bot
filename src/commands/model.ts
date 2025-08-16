import { createCommandConfig, logger, Flashcore } from 'robo.js'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'

// Import the user memory interface from chat
interface Message {
	role: 'system' | 'user' | 'assistant'
	content: string
}

interface UserMemory {
	messages: Message[]
	lastInteraction: number
	preferredModel?: string
}

export const config = createCommandConfig({
	description: 'set your preferred AI model for chat',
	options: [
		{
			type: 'string',
			name: 'model',
			description: 'the AI model you want to use',
			required: true,
			choices: [
				{ name: 'deepseek-r1:32b (Powerful, comprehensive)', value: 'deepseek-r1:32b' },
				{ name: 'llama3-groq-tool-use:8b (Default, tools capable)', value: 'llama3-groq-tool-use:8b' },
				{ name: 'dolphin-llama3:8b (Conversational)', value: 'dolphin-llama3:8b' },
				{ name: 'llama3.2:3b (Smaller, faster)', value: 'llama3.2:3b' },
				{ name: 'deepseek-r1:7b (Balanced)', value: 'deepseek-r1:7b' },
				{ name: 'deepseek-coder-v2:16b (Programming focused)', value: 'deepseek-coder-v2:16b' },
				{ name: 'llama3.2:latest (Latest llama)', value: 'llama3.2:latest' }
			]
		}
	]
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply()

	const selectedModel = interaction.options.getString('model', true)
	const userId = interaction.user.id

	// Get user memories
	const userMemories = await Flashcore.get<Record<string, UserMemory>>('chat_memories') || {}

	// Get or create user memory
	let userMemory = userMemories[userId] || {
		messages: [],
		lastInteraction: Date.now()
	}

	// Update preferred model
	userMemory.preferredModel = selectedModel
	userMemory.lastInteraction = Date.now()

	// Save updated memory
	userMemories[userId] = userMemory
	await Flashcore.set('chat_memories', userMemories)

	// Create embed response
	const embed = new EmbedBuilder()
		.setTitle('Model Updated')
		.setDescription(`your preferred AI model has been set to **${selectedModel}**.\nthis model will be used for all your future chat interactions.`)
		.setColor('#00FF00')
		.setFooter({ text: 'you can change this anytime with the /model command' })

	logger.info(`User ${interaction.user.tag} set preferred model to ${selectedModel}`)

	await interaction.editReply({ embeds: [embed] })
}
