const PLUGIN_NAME = "Roblox Auto RPC";

let timer = null;
let activity = null;

function log(message, ...args) {
	console.log(`[${PLUGIN_NAME}] ${message}`, ...args);
}

function getRobloxActivity() {
	// Look for Roblox information exposed by the host/runtime.
	// This intentionally avoids assuming undocumented Revenge APIs.
	const globalObject = globalThis;

	const roblox =
		globalObject.Roblox ??
		globalObject.roblox ??
		globalObject.__ROBLOX__ ??
		null;

	if (!roblox) {
		return null;
	}

	const game = roblox.game ?? roblox.Game ?? roblox.currentGame ?? null;

	if (!game) {
		return null;
	}

	const name =
		game.name ??
		game.displayName ??
		game.title ??
		"Roblox";

	const placeId =
		game.placeId ??
		game.placeID ??
		game.id ??
		null;

	return {
		name: String(name),
		placeId: placeId != null ? String(placeId) : null,
	};
}

function updateActivity() {
	try {
		const next = getRobloxActivity();

		if (!next) {
			if (activity !== null) {
				activity = null;
				log("Roblox activity cleared");
			}

			return;
		}

		const changed =
			!activity ||
			activity.name !== next.name ||
			activity.placeId !== next.placeId;

		if (!changed) {
			return;
		}

		activity = next;

		log("Roblox activity detected:", activity);

		/*
		 * Revenge currently does not provide a documented public
		 * Discord Rich Presence API for arbitrary external games.
		 *
		 * Keep the detected activity here so a supported RPC bridge
		 * can be connected without breaking the plugin.
		 */
	} catch (error) {
		console.error(`[${PLUGIN_NAME}] Failed to update activity:`, error);
	}
}

export default {
	name: PLUGIN_NAME,

	description:
		"Detects Roblox activity and prepares it for Rich Presence integration.",

	authors: [
		{
			name: "Jzsnipr",
			id: 0,
		},
	],

	start() {
		log("Started");

		updateActivity();

		timer = setInterval(updateActivity, 5000);
	},

	stop() {
		if (timer !== null) {
			clearInterval(timer);
			timer = null;
		}

		activity = null;

		log("Stopped");
	},
};
