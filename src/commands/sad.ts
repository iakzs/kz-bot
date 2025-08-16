import { createCommandConfig } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'
import { executeAnimeCommand } from '../utils/animeBase'

export const config = createCommandConfig({
  description: 'Sad with a cute anime gif',
  options: [
    {
      type: 'user',
      name: 'user',
      description: 'The user to sad',
      required: false
    }
  ]
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
  await executeAnimeCommand(interaction, 'sad', 'sad')
}
