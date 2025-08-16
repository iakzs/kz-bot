import { Flashcore } from 'robo.js'

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
	[commandName: string]: {
		totalUses: number;
		userStats: Record<string, CommandUsage>;
		receiverStats: Record<string, CommandUsage>;
		pairStats: Record<string, UserPairUsage>;
	};
}

export async function trackCommandUsage(
	commandName: string,
	userId: string,
	username: string,
	targetId?: string,
	targetName?: string
): Promise<{
	userUsage: CommandUsage;
	targetUsage?: CommandUsage;
	pairUsage?: UserPairUsage;
}> {
	const stats = (await Flashcore.get<CommandStats>('animeCommandStats')) || {};

	if (!stats[commandName]) {
		stats[commandName] = {
			totalUses: 0,
			userStats: {},
			receiverStats: {},
			pairStats: {}
		};
	}

	if (!stats[commandName].userStats[userId]) {
		stats[commandName].userStats[userId] = {
			userId,
			username,
			count: 0
		};
	}

	stats[commandName].totalUses += 1;
	stats[commandName].userStats[userId].count += 1;

	const result: {
		userUsage: CommandUsage;
		targetUsage?: CommandUsage;
		pairUsage?: UserPairUsage;
	} = {
		userUsage: stats[commandName].userStats[userId]
	};

	if (targetId && targetName) {
		if (!stats[commandName].receiverStats[targetId]) {
			stats[commandName].receiverStats[targetId] = {
				userId: targetId,
				username: targetName,
				count: 0
			};
		}

		stats[commandName].receiverStats[targetId].count += 1;
		result.targetUsage = stats[commandName].receiverStats[targetId];

		const pairId = [userId, targetId].sort().join('-');

		if (!stats[commandName].pairStats[pairId]) {
			const [firstId, secondId] = [userId, targetId].sort();
			const [firstName, secondName] = firstId === userId ? [username, targetName] : [targetName, username];

			stats[commandName].pairStats[pairId] = {
				user1Id: firstId,
				user1Name: firstName,
				user2Id: secondId,
				user2Name: secondName,
				count: 0
			};
		}

		stats[commandName].pairStats[pairId].count += 1;
		result.pairUsage = stats[commandName].pairStats[pairId];
	}

	await Flashcore.set('animeCommandStats', stats);

	return result;
}

export async function getCommandStats(commandName: string): Promise<{
	totalUses: number;
	topUsers: CommandUsage[];
	topReceivers: CommandUsage[];
	topPairs: UserPairUsage[];
}> {
	const stats = (await Flashcore.get<CommandStats>('animeCommandStats')) || {};

	if (!stats[commandName]) {
		return {
			totalUses: 0,
			topUsers: [],
			topReceivers: [],
			topPairs: []
		};
	}

	const topUsers = Object.values(stats[commandName].userStats)
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	const topReceivers = Object.values(stats[commandName].receiverStats)
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	const topPairs = Object.values(stats[commandName].pairStats)
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	return {
		totalUses: stats[commandName].totalUses,
		topUsers,
		topReceivers,
		topPairs
	};
}

export async function getUserStats(userId: string): Promise<{
	totalSent: number;
	totalReceived: number;
	commandsSent: Record<string, number>;
	commandsReceived: Record<string, number>;
}> {
	const stats = (await Flashcore.get<CommandStats>('animeCommandStats')) || {};

	const result = {
		totalSent: 0,
		totalReceived: 0,
		commandsSent: {} as Record<string, number>,
		commandsReceived: {} as Record<string, number>
	};

	for (const [commandName, commandStats] of Object.entries(stats)) {
		if (commandStats.userStats[userId]) {
			const count = commandStats.userStats[userId].count;
			result.totalSent += count;
			result.commandsSent[commandName] = count;
		}

		if (commandStats.receiverStats[userId]) {
			const count = commandStats.receiverStats[userId].count;
			result.totalReceived += count;
			result.commandsReceived[commandName] = count;
		}
	}

	return result;
}
