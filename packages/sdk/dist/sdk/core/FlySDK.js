import { FlyApiClient } from "../api/FlyApiClient";
export class FlySDK {
    constructor(config) {
        this.apiClient = new FlyApiClient(config.apiToken);
    }
    getApiClient() {
        return this.apiClient;
    }
}
