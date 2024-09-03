import type { FlyStack } from './FlyStack';
import { FlyDomain } from './FlyDomain';
import type { FlyCertificate } from './FlyCertificate';
import type { FlySecret } from './FlySecret';
import type { AnycastIP } from './AnycastIP';
import type { FlyProxy } from './FlyProxy';

export class FlyApp {
  private stack: FlyStack;
  private config: IFlyAppConfig;

  constructor(stack: FlyStack, config: IFlyAppConfig) {
    this.stack = stack;
    this.config = config;
  }
}

export interface IFlyAppConfig {
  name: string;
  domain: string;
  certificate: FlyCertificate;
  secrets: FlySecret[];
  env: Record<string, string>;
  publicServices: {
    website: AnycastIP;
  };
  privateServices: {
    api: FlyProxy;
  };
}