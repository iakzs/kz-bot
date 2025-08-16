const stateStore = new Map<string, { createdAt: number }>();

export function storeState(state: string): void {
	console.log(`Storing state: ${state}`);
	stateStore.set(state, { createdAt: Date.now() });

	if (Math.random() < 0.1) {
		cleanupOldStates();
	}
}

export function verifyState(state: string): boolean {
	console.log(`Verifying state: ${state}`);
	const stateData = stateStore.get(state);

	if (!stateData) {
		console.log(`State not found: ${state}`);
		return false;
	}

	if (Date.now() - stateData.createdAt > 10 * 60 * 1000) {
		console.log(`State expired: ${state}`);
		stateStore.delete(state);
		return false;
	}

	console.log(`State valid: ${state}`);
	stateStore.delete(state);
	return true;
}

function cleanupOldStates(): void {
	console.log('Cleaning up old states');
	const now = Date.now();
	let count = 0;

	for (const [state, data] of stateStore.entries()) {
		if (now - data.createdAt > 10 * 60 * 1000) {
			stateStore.delete(state);
			count++;
		}
	}

	console.log(`Cleaned up ${count} expired states`);
}

export function getAllStates(): Array<{ state: string, createdAt: Date }> {
	return Array.from(stateStore.entries()).map(([state, data]) => ({
		state,
		createdAt: new Date(data.createdAt)
	}));
}
