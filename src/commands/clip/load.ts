import { createCommandConfig, Flashcore, logger } from 'robo.js'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { r2Client, BUCKET_NAME } from '../../utils/r2';
import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

export const config = createCommandConfig({
	description: 'load and display a specific image by ID or name',
	options: [
		{
			type: 'string',
			name: 'image_name',
			description: 'the name or ID of the image to load',
			required: true
		}
	]
} as const);

export default async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply();
	logger.info(`load command used by ${interaction.user.tag}`);

	const bans = (await Flashcore.get<Record<string, string>>('bans')) || {}
	if (bans[interaction.user.id] || bans[interaction.user.tag]) {
		logger.warn(`Banned user ${interaction.user.tag} tried to use clip command`)
		return interaction.editReply('you are banned from using kz-bot.')
	}

	const imageName = interaction.options.getString('image_name', true);

	try {
		let key = `uploads/${imageName}`;

		try {
			await r2Client.send(new HeadObjectCommand({
				Bucket: BUCKET_NAME,
				Key: key
			}));
		} catch (error) {
			logger.info(`Image not found with exact name, trying partial match for: ${imageName}`);

			const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
			const listCommand = new ListObjectsV2Command({
				Bucket: BUCKET_NAME,
				Prefix: 'uploads/'
			});

			const result = await r2Client.send(listCommand);

			if (!result.Contents || result.Contents.length === 0) {
				return interaction.editReply('no images found in storage.');
			}

			const matchedFile = result.Contents.find(file =>
				file.Key && file.Key.toLowerCase().includes(imageName.toLowerCase())
			);

			if (!matchedFile || !matchedFile.Key) {
				return interaction.editReply(`no image found matching "${imageName}".`);
			}

			key = matchedFile.Key;
		}

		const fileUrl = `https://kz-bot-cdn.iakzs.lol/${key}`;
		const fileName = key.split('/').pop() || 'image';

		const embed = new EmbedBuilder()
			.setTitle(`image: ${fileName}`)
			.setColor(0x00FFFF)
			.setImage(fileUrl)
			.setURL(fileUrl)
			.setFooter({ text: `requested by ${interaction.user.tag}` })
			.setTimestamp();

		return interaction.editReply({ embeds: [embed] });
	} catch (error) {
		logger.error(`Error loading image ${imageName}:`, error);
		return interaction.editReply(`an error occurred while loading the image: ${error instanceof Error ? error.message : String(error)}`);
	}
};
