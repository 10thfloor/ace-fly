import type { FlySDK } from './FlySDK';

export class FlyStack {
  private sdk: FlySDK;
  private name: string;

  constructor(sdk: FlySDK, name: string) {
    this.sdk = sdk;
    this.name = name;
  }
}