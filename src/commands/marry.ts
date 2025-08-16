import { createCommandConfig, logger, Flashcore } from 'robo.js'
import { ChatInputCommandInteraction, EmbedBuilder, User } from 'discord.js'

interface Marriage {
  partnerId: string
  partnerTag: string
  marriageDate: number
  proposalMessage?: string
}

interface MarriageDatabase {
  marriages: Record<string, Marriage>
  proposals: Record<string, string> // userId -> targetId
}

export const config = createCommandConfig({
  description: 'propose to or marry another user',
  options: [
    {
      type: 'user',
      name: 'user',
      description: 'the user you want to propose to or marry',
      required: false
    },
    {
      type: 'string',
      name: 'message',
      description: 'a special message for your proposal',
      required: false
    },
    {
      type: 'string',
      name: 'action',
      description: 'what action to take',
      required: false,
      choices: [
        { name: 'Propose', value: 'propose' },
        { name: 'Accept', value: 'accept' },
        { name: 'Decline', value: 'decline' },
        { name: 'Divorce', value: 'divorce' },
        { name: 'Status', value: 'status' }
      ]
    }
  ]
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply()

  const marriageDb = await Flashcore.get<MarriageDatabase>('marriages') || { marriages: {}, proposals: {} }

  const action = interaction.options.getString('action') || 'status'
  const targetUser = interaction.options.getUser('user')
  const message = interaction.options.getString('message') || ''

  const userId = interaction.user.id
  const userTag = interaction.user.tag

  const embed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setTimestamp()

  switch (action) {
    case 'propose':
      if (marriageDb.marriages[userId]) {
        embed.setTitle('Already Married')
          .setDescription(`you're already married to <@${marriageDb.marriages[userId].partnerId}>! you need to get a divorce first.`)
          .setColor('#FF0000')
        break
      }

      if (!targetUser) {
        embed.setTitle('Marriage Proposal')
          .setDescription(`you need to specify who you want to propose to using the \`user\` option.`)
          .setColor('#FFA500')
        break
      }

      if (targetUser.bot) {
        embed.setTitle('Cannot Marry Bots')
          .setDescription(`you cannot propose to bots, only to other users.`)
          .setColor('#FF0000')
        break
      }

      if (targetUser.id === userId) {
        embed.setTitle('Cannot Marry Yourself')
          .setDescription(`you cannot propose to yourself. find someone special!`)
          .setColor('#FF0000')
        break
      }

      if (marriageDb.marriages[targetUser.id]) {
        embed.setTitle('Already Taken')
          .setDescription(`<@${targetUser.id}> is already married to someone else!`)
          .setColor('#FF0000')
        break
      }

      marriageDb.proposals[userId] = targetUser.id

      embed.setTitle('Marriage Proposal')
        .setDescription(`💍 <@${userId}> has proposed to <@${targetUser.id}>! ${message ? `\n\nmessage: "${message}"` : ''}\n\nto accept, use \`/marry action:Accept\``)
        .setFooter({ text: 'to accept this proposal, the proposed person should use the /marry command with the Accept action' })
      break

    case 'accept':
      const proposerId = Object.keys(marriageDb.proposals).find(id => marriageDb.proposals[id] === userId)

      if (!proposerId) {
        embed.setTitle('No Proposal')
          .setDescription(`You don't have any pending marriage proposals.`)
          .setColor('#FFA500')
        break
      }

      if (marriageDb.marriages[userId] || marriageDb.marriages[proposerId]) {
        embed.setTitle('Already Married')
          .setDescription(`Either you or the proposer is already married to someone else!`)
          .setColor('#FF0000')
        delete marriageDb.proposals[proposerId]
        break
      }

      const marriageDate = Date.now()
      const proposerTag = interaction.client.users.cache.get(proposerId)?.tag || 'Unknown User'

      const proposalMessage = message || ''

      marriageDb.marriages[userId] = {
        partnerId: proposerId,
        partnerTag: proposerTag,
        marriageDate
      }

      marriageDb.marriages[proposerId] = {
        partnerId: userId,
        partnerTag: userTag,
        marriageDate,
        proposalMessage
      }

      delete marriageDb.proposals[proposerId]

      embed.setTitle('Marriage Accepted!')
        .setDescription(`💖 <@${userId}> and <@${proposerId}> are now officially married! 💖`)
        .setImage('https://cdn.discordapp.com/attachments/1369240547080015922/1395108634178093199/image.png?ex=68793faa&is=6877ee2a&hm=9b503de0eda5e1bf6c58853a2ebde7b78dd694f591f515595efb16b5fc073d6b&')
      break

    case 'decline':
      const declinedProposerId = Object.keys(marriageDb.proposals).find(id => marriageDb.proposals[id] === userId)

      if (!declinedProposerId) {
        embed.setTitle('No Proposal')
          .setDescription(`you don't have any pending marriage proposals.`)
          .setColor('#FFA500')
        break
      }

      delete marriageDb.proposals[declinedProposerId]

      embed.setTitle('Proposal Declined')
        .setDescription(`you have declined the marriage proposal from <@${declinedProposerId}>.`)
        .setColor('#FFA500')
      break

    case 'divorce':
      if (!marriageDb.marriages[userId]) {
        embed.setTitle('Not Married')
          .setDescription(`you're not currently married to anyone.`)
          .setColor('#FFA500')
        break
      }

      const partnerId = marriageDb.marriages[userId].partnerId

      delete marriageDb.marriages[userId]
      if (marriageDb.marriages[partnerId]) {
        delete marriageDb.marriages[partnerId]
      }

      embed.setTitle('Divorced')
        .setDescription(`💔 <@${userId}> has divorced <@${partnerId}>. the marriage has ended.`)
        .setColor('#808080')
      break

    case 'status':
    default:
      if (marriageDb.marriages[userId]) {
        const marriage = marriageDb.marriages[userId]
        const marriageDate = new Date(marriage.marriageDate).toLocaleDateString()
        const daysMarried = Math.floor((Date.now() - marriage.marriageDate) / (1000 * 60 * 60 * 24))

        embed.setTitle('Marriage Status')
          .setDescription(`💖 <@${userId}> is married to <@${marriage.partnerId}> since ${marriageDate} (${daysMarried} days)`)
          .setColor('#FF69B4')

        if (marriage.proposalMessage) {
          embed.addFields({ name: 'Proposal Message', value: marriage.proposalMessage })
        }
      }
      else if (marriageDb.proposals[userId]) {
        embed.setTitle('Active Proposal')
          .setDescription(`you have proposed to <@${marriageDb.proposals[userId]}>. waiting for a response.`)
          .setColor('#FFA500')
      }
      else {
        const receivedProposal = Object.keys(marriageDb.proposals).find(id => marriageDb.proposals[id] === userId)

        if (receivedProposal) {
          embed.setTitle('Pending Proposal')
            .setDescription(`you have a marriage proposal from <@${receivedProposal}>.\nuse \`/marry action:Accept\` to accept or \`/marry action:Decline\` to decline.`)
            .setColor('#FFA500')
        } else {
          embed.setTitle('Marriage Status')
            .setDescription(`you're not married and don't have any active proposals.\nuse \`/marry user:@someone action:Propose\` to propose to someone!`)
            .setColor('#808080')
        }
      }
      break
  }

  await Flashcore.set('marriages', marriageDb)

  await interaction.editReply({ embeds: [embed] })
}
