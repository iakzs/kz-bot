import { logger, Flashcore } from 'robo.js'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { trackCommandUsage } from './trackCommandUsage'
import fetch from 'node-fetch'

interface OtakuGifResponse {
	url: string;
}

interface CommandUsage {
	userId: string;
	username: string;
	count: number;
}

interface UserPairUsage {
	user1Id: string;
	user1Name: string;
	user2Id: string;
	user2Name: string;
	count: number;
}

interface CommandStats {
	userUsage: CommandUsage;
	targetUsage?: CommandUsage;
	pairUsage?: UserPairUsage;
}

export async function executeAnimeCommand(
	interaction: ChatInputCommandInteraction,
	category: string,
	commandName: string
): Promise<void> {
	await interaction.deferReply()
	logger.info(`${commandName} command used by ${interaction.user.tag}`)

	const bans = (await Flashcore.get<Record<string, string>>('bans')) || {}
	if (bans[interaction.user.id] || bans[interaction.user.tag]) {
		logger.warn(`Banned user ${interaction.user.tag} tried to use ${commandName} command`)
		await interaction.editReply('You are banned from using kz-bot.')
		return;
	}

	try {
		const target = interaction.options.getUser('user')

		const stats: CommandStats = await trackCommandUsage(
			commandName,
			interaction.user.id,
			interaction.user.tag,
			target?.id,
			target?.tag
		)

		// slow but works, sometimes.
		const endpoint = `https://api.otakugifs.xyz/gif?reaction=${category}&format=gif`
		const response = await fetch(endpoint)

		if (!response.ok) {
			logger.error(`Error fetching ${category} from OtakuGIFs: ${response.statusText}`)
			await interaction.editReply(`Failed to fetch ${category} gif. Please try again later.`)
			return;
		}

		const data = await response.json() as OtakuGifResponse

		const embed = new EmbedBuilder()
			.setColor('#FF69B4')
			.setImage(data.url)
			.setTimestamp()

		if (target) {
			const actionVerbs: Record<string, string> = {
				hug: 'hugs',
				pat: 'pats',
				slap: 'slaps',
				kiss: 'kisses',
				bite: 'bites',
				cuddle: 'cuddles',
				poke: 'pokes',
				tickle: 'tickles',
				lick: 'licks',
			}

			const verb = actionVerbs[commandName] || `${commandName}s`

			embed.setTitle(`${interaction.user.username} ${verb} ${target.username}`)

			if ('targetUsage' in stats && 'pairUsage' in stats && stats.targetUsage && stats.pairUsage) {
				embed.setFooter({
					text: `${stats.userUsage.count} times from ${interaction.user.username} • ${stats.targetUsage.count} times to ${target.username} • ${stats.pairUsage.count} times between them`
				})
			} else {
				embed.setFooter({
					text: `${interaction.user.username} has used this ${stats.userUsage.count} time${stats.userUsage.count === 1 ? '' : 's'}`
				})
			}
		} else {
			embed.setTitle(`Random ${commandName} gif`)
			embed.setFooter({
				text: `Requested by ${interaction.user.tag} • Used ${stats.userUsage.count} time${stats.userUsage.count === 1 ? '' : 's'}`
			})
		}

		await interaction.editReply({ embeds: [embed] })

	} catch (error) {
		logger.error(`Error during ${commandName} command: ${error instanceof Error ? error.message : String(error)}`)
		await interaction.editReply(`An error occurred while fetching the anime gif. Please try again later.`)
	}
}
