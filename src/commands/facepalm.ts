import { createCommandConfig } from 'robo.js'
import type { ChatInputCommandInteraction } from 'discord.js'
import { executeAnimeCommand } from '../utils/animeBase'

export const config = createCommandConfig({
  description: 'Facepalm with a cute anime gif',
  options: [
    {
      type: 'user',
      name: 'user',
      description: 'The user to facepalm',
      required: false
    }
  ]
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
  await executeAnimeCommand(interaction, 'facepalm', 'facepalm')
}
