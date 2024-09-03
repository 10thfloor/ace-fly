import { FlyStack } from "./FlyStack";
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

  createStack(name: string): FlyStack {
    return new FlyStack(this, name);
  }

  getApiClient(): FlyApiClient {
    return this.apiClient;
  }
}