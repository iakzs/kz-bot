import { createCommandConfig } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'
import { executeAnimeCommand } from '../utils/animeBase'

export const config = createCommandConfig({
  description: 'Huh with a cute anime gif',
  options: [
    {
      type: 'user',
      name: 'user',
      description: 'The user to huh',
      required: false
    }
  ]
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
  await executeAnimeCommand(interaction, 'huh', 'huh')
}
