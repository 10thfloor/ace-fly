export interface AceConfig {
	apiToken: string;
}

export interface ServiceConfig {
	name: string;
	port: number;
	protocol: "tcp" | "udp";
}

export interface VolumeConfig {
	name: string;
	sizeGB: number;
}

