import { AceSDK } from "../sdk/AceSDK.js";

export async function deploy(args: string[]): Promise<void> {
	const ace = new AceSDK({ apiToken: process.env.ACE_API_TOKEN || "" });
	// TODO: Load user's stack definitions dynamically
}

export async function dev(args: string[]): Promise<void> {
	const ace = new AceSDK({ apiToken: process.env.ACE_API_TOKEN || "" });
	// TODO: Implement local development server
}

// Add more CLI commands as needed
