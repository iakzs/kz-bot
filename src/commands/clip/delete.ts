import { createCommandConfig, logger, Flashcore } from 'robo.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const config = createCommandConfig({
  description: 'deletet a clip by its ID',
  options: [
    {
      type: 'string',
      name: 'id',
      description: 'the ID of the clip to delete',
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
  logger.info(`clip delete command used by ${interaction.user.tag}`);

  // Check if user is banned
  const bans = (await Flashcore.get<Record<string, string>>('bans')) || {}
  if (bans[interaction.user.id] || bans[interaction.user.tag]) {
    logger.warn(`Banned user ${interaction.user.tag} tried to use clip delete command`)
    return interaction.editReply('you are banned from using kz-bot.')
  }

  const clipId = interaction.options.getString('id', true);

  try {
    // Get all clips
    const allClips = await Flashcore.get<Record<string, ClipData>>('clips') || {};

    // Find the requested clip
    const clip = allClips[clipId];

    if (!clip) {
      return interaction.editReply(`no clip found with ID: ${clipId}`);
    }

    // Check if user is authorized to delete this clip
    const isKz = interaction.user.id === process.env.KZ_USER_ID;
    const isOwner = clip.createdBy === interaction.user.id;

    if (!isKz && !isOwner) {
      return interaction.editReply("you don't have permission to delete this clip.");
    }

    // Delete the clip
    delete allClips[clipId];
    await Flashcore.set('clips', allClips);

    // Create embed response
    const embed = new EmbedBuilder()
      .setTitle('clip delet')
      .setColor(0xFF0000)
      .setDescription(`clip with ID \`${clipId}\` has been deleted.`)
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Error deleting clip: ${error instanceof Error ? error.message : String(error)}`);
    return interaction.editReply('an error occurred while deleting the clip. please try again later.');
  }
};
