export class FlySDK {
  private name: string;
  private context: IFlySDKConfig;

  constructor(name: string, context: IFlySDKConfig) {
    this.name = name;
    this.context = context;
  }
}

export interface IFlySDKConfig {
  apiToken: string;
  organization?: string;
}