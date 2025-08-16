import { createCommandConfig } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'
import { executeAnimeCommand } from '../utils/animeBase'

export const config = createCommandConfig({
  description: 'Thumbsup with a cute anime gif',
  options: [
    {
      type: 'user',
      name: 'user',
      description: 'The user to thumbsup',
      required: false
    }
  ]
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
  await executeAnimeCommand(interaction, 'thumbsup', 'thumbsup')
}
