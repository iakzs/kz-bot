import { createCommandConfig, logger, Flashcore } from 'robo.js';
import { ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { uploadFile } from '../../utils/upload';
import crypto from 'crypto';

export const config = createCommandConfig({
  description: 'Create a clip with a message to share',
  options: [
    {
      type: 'string',
      name: 'message',
      description: 'The message to include in the clip',
      required: true
    }
  ]
} as const);

interface ClipData {
  id: string;
  message: string;
  createdBy: string;
  createdAt: number;
  userTag: string;
}

export default async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();
  logger.info(`clip command used by ${interaction.user.tag}`);

  // Check if user is banned
  const bans = (await Flashcore.get<Record<string, string>>('bans')) || {}
  if (bans[interaction.user.id] || bans[interaction.user.tag]) {
    logger.warn(`Banned user ${interaction.user.tag} tried to use clip command`)
    return interaction.editReply('you are banned from using kz-bot.')
  }

  const message = interaction.options.getString('message', true);

  try {
    // Generate a unique ID for the clip - use first 8 characters of SHA-256 hash
    const clipId = crypto.createHash('sha256')
      .update(`${interaction.user.id}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 8);

    // Store clip data
    const clipData: ClipData = {
      id: clipId,
      message,
      createdBy: interaction.user.id,
      createdAt: Date.now(),
      userTag: interaction.user.tag
    };

    // Store in Flashcore
    const allClips = await Flashcore.get<Record<string, ClipData>>('clips') || {};
    allClips[clipId] = clipData;
    await Flashcore.set('clips', allClips);

    // Create embed response
    const embed = new EmbedBuilder()
      .setTitle('Clip Created')
      .setColor(0x00FFFF)
      .setDescription(message)
      .addFields(
        { name: 'Clip ID', value: clipId, inline: true },
        { name: 'Created by', value: interaction.user.tag, inline: true }
      )
      .setFooter({ text: `Use /clip view ${clipId} to view this clip` })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Error creating clip: ${error instanceof Error ? error.message : String(error)}`);
    return interaction.editReply('An error occurred while creating the clip. Please try again later.');
  }
};
