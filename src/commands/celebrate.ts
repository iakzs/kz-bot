import { createCommandConfig } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'
import { executeAnimeCommand } from '../utils/animeBase'

export const config = createCommandConfig({
  description: 'Celebrate with a cute anime gif',
  options: [
    {
      type: 'user',
      name: 'user',
      description: 'The user to celebrate',
      required: false
    }
  ]
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
  await executeAnimeCommand(interaction, 'celebrate', 'celebrate')
}
