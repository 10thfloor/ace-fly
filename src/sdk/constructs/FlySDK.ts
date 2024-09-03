import { FlyApiClient } from "../api/FlyApiClient";

export interface IFlySDKConfig {
  apiToken: string;
  // Add other global configuration options
}

export class FlySDK {
  private apiClient: FlyApiClient;

  constructor(config: IFlySDKConfig) {
    this.apiClient = new FlyApiClient(config.apiToken);
  }

  getApiClient(): FlyApiClient {
    return this.apiClient;
  }
}