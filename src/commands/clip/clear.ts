import { createCommandConfig, logger, Flashcore } from 'robo.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const config = createCommandConfig({
  description: 'Clear all your clips',
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
  logger.info(`clip clear command used by ${interaction.user.tag}`);

  // Check if user is banned
  const bans = (await Flashcore.get<Record<string, string>>('bans')) || {}
  if (bans[interaction.user.id] || bans[interaction.user.tag]) {
    logger.warn(`Banned user ${interaction.user.tag} tried to use clip clear command`)
    return interaction.editReply('you are banned from using kz-bot.')
  }

  try {
    // Get all clips
    const allClips = await Flashcore.get<Record<string, ClipData>>('clips') || {};
    
    if (Object.keys(allClips).length === 0) {
      return interaction.editReply('There are no clips to clear.');
    }
    
    // Check if user is kz
    const isKz = interaction.user.id === process.env.KZ_USER_ID;
    let clipCount = 0;
    
    if (isKz) {
      // If kz, confirm they want to delete ALL clips
      // This would typically use a confirmation button in production... but this is just a test bot, said kz
      clipCount = Object.keys(allClips).length;
      await Flashcore.set('clips', {});
    } else {
      // If not kz, only delete their own clips
      const newClips = { ...allClips };
      
      // Count clips from the user and delete them
      Object.keys(newClips).forEach(id => {
        if (newClips[id].createdBy === interaction.user.id) {
          delete newClips[id];
          clipCount++;
        }
      });
      
      if (clipCount === 0) {
        return interaction.editReply("You don't have any clips to clear.");
      }
      
      await Flashcore.set('clips', newClips);
    }
    
    // Create embed response
    const embed = new EmbedBuilder()
      .setTitle('Clips Cleared')
      .setColor(0xFF0000)
      .setDescription(isKz 
        ? `All ${clipCount} clips have been deleted.` 
        : `All ${clipCount} of your clips have been deleted.`)
      .setTimestamp();
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Error clearing clips: ${error instanceof Error ? error.message : String(error)}`);
    return interaction.editReply('An error occurred while clearing clips. Please try again later.');
  }
};
