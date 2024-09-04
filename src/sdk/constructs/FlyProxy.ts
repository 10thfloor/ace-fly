import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import type { FlyMachine } from "./FlyMachine";
import type { LBConfig } from "./LBConfig";
import { FlyStack } from "../core/FlyStack";

export interface IFlyProxyConfig {
  name: string;
  machines: {
    [key: string]: FlyMachine;
  };
  ports: {
    [key: number]: string;
  };
  loadBalancing: LBConfig;
}

export class FlyProxy extends StackConstruct {
  
  @Dependency()
  private machines: {
    [key: string]: FlyMachine;
  };

  @Dependency()
  private loadBalancing: LBConfig;

  private ports: {
    [key: number]: string;
  };

  constructor(stack: FlyStack, name: string, config: IFlyProxyConfig) {
    super(stack, name);
    this.name = config.name;
    this.machines = config.machines;
    this.ports = config.ports;
    this.loadBalancing = config.loadBalancing;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'proxy',
      name: this.name,
      machines: Object.fromEntries(
        Object.entries(this.machines).map(([key, machine]) => [key, machine.getName()])
      ),
      ports: this.ports,
      loadBalancing: this.loadBalancing.synthesize()
    };
  }

  protected validate(): boolean {
    return true;
  }

  protected requiredDependencies(): string[] {
    return ['FlyMachine', 'LBConfig'];
  }
}