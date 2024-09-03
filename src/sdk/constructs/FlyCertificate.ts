import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface IFlyCertificateConfig {
  name: string;
  domains: string;
}

export class FlyCertificate extends StackConstruct {
  private config: IFlyCertificateConfig;

  constructor(stack: FlyStack, name: string, config: IFlyCertificateConfig) {
    super(stack, name);
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'certificate',
      name: this.name,
      domains: this.config.domains
    };
  }

  protected validate(): boolean {
    return true;
  }
}