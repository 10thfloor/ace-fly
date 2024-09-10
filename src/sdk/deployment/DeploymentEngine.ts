

import type { FlyApiClient } from "../api/FlyApiClient";

export class DeploymentEngine {
	private apiClient: FlyApiClient;

	constructor(apiClient: FlyApiClient) {
		this.apiClient = apiClient;
	}
}
