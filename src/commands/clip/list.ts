import { createCommandConfig, logger, Flashcore } from 'robo.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const config = createCommandConfig({
  description: 'List available clips',
  options: []
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
  logger.info(`clip list command used by ${interaction.user.tag}`);

  const bans = (await Flashcore.get<Record<string, string>>('bans')) || {}
  if (bans[interaction.user.id] || bans[interaction.user.tag]) {
    logger.warn(`Banned user ${interaction.user.tag} tried to use clip list command`)
    return interaction.editReply('you are banned from using kz-bot.')
  }

  try {
    const allClips = await Flashcore.get<Record<string, ClipData>>('clips') || {};

    if (Object.keys(allClips).length === 0) {
      return interaction.editReply('No clips have been created yet.');
    }

    const isKz = interaction.user.id === process.env.KZ_USER_ID;

    let filteredClips: ClipData[] = Object.values(allClips);

    if (!isKz) {
      filteredClips = filteredClips.filter(clip => clip.createdBy === interaction.user.id);

      if (filteredClips.length === 0) {
        return interaction.editReply("You haven't created any clips yet.");
      }
    }

    filteredClips.sort((a, b) => b.createdAt - a.createdAt);

    const recentClips = filteredClips.slice(0, 10);

    const embed = new EmbedBuilder()
      .setTitle(isKz ? 'All Recent Clips' : 'Your Clips')
      .setColor(0x00FFFF)
      .setDescription(isKz ? 'Here are the most recent clips from all users:' : 'Here are your most recent clips:');

    recentClips.forEach((clip, index) => {
      const truncatedMessage = clip.message.length > 100
        ? `${clip.message.substring(0, 97)}...`
        : clip.message;

      const creationDate = new Date(clip.createdAt).toLocaleString();

      embed.addFields({
        name: `${index + 1}. Clip ID: ${clip.id}`,
        value: `"${truncatedMessage}"\n**Created by:** ${clip.userTag}\n**Date:** ${creationDate}`
      });
    });

    embed.setFooter({ text: `Use /clip view [ID] to view a specific clip` });

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Error listing clips: ${error instanceof Error ? error.message : String(error)}`);
    return interaction.editReply('An error occurred while retrieving the clips. Please try again later.');
  }
};
