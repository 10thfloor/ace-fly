import type { FlyStack } from "../core/FlyStack";
import type { FlyMachine } from "./FlyMachine";
import type { LBConfig } from "./LBConfig";
import { StackConstruct } from "./StackConstruct";

export interface IFlyProxyConfig {
  name: string;
  machines: Record<string, FlyMachine>;
  ports: Record<number, string>;
  loadBalancing: LBConfig;
}

export class FlyProxy extends StackConstruct {
  private config: IFlyProxyConfig;

  constructor(stack: FlyStack, name: string, config: IFlyProxyConfig) {
    super(stack, name);
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'proxy',
      name: this.name,
      machines: Object.fromEntries(
        Object.entries(this.config.machines).map(([key, machine]) => [key, machine.getName()])
      ),
      ports: this.config.ports,
      loadBalancing: this.config.loadBalancing.synthesize()
    };
  }

  protected validate(): boolean {
    return true;
  }
}