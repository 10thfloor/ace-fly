import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import type { FlyMachine } from "./FlyMachine";
import type { LBConfig } from "./LBConfig";
import { FlyStack } from "../core/FlyStack";
import type { ResourceOrReference } from "../../types";
export interface IFlyProxyConfig {
  name?: string;
  machines: {
    [key: string]: ResourceOrReference<FlyMachine>;
  };
  ports: {
    [key: number]: string;
  };
  loadBalancing: ResourceOrReference<LBConfig>;
}

export class FlyProxy extends StackConstruct {
  @Dependency()
  private machines: {
    [key: string]: ResourceOrReference<FlyMachine>;
  };

  @Dependency()
  private loadBalancing: ResourceOrReference<LBConfig>;

  private ports: {
    [key: number]: string;
  };

  private config: IFlyProxyConfig;

  constructor(stack: FlyStack, id: string, config: IFlyProxyConfig) {
    super(stack, id);
    this.machines = config.machines;
    this.ports = config.ports;
    this.loadBalancing = config.loadBalancing;
    this.config = config;
    this.initialize();
  }

  synthesize(): Record<string, any> {
    return {
      type: "proxy",
      name: this.config.name || this.getId(),
      machines: Object.fromEntries(
        Object.entries(this.machines).map(([key, machine]) => [
          key,
          this.getResource(machine).getId(),
        ]),
      ),
      ports: this.ports,
      loadBalancing: this.getResource(this.loadBalancing).getId(),
    };
  }

  protected validate(): boolean {
    return true;
  }

  protected requiredDependencies(): string[] {
    return ["FlyMachine", "LBConfig"];
  }
}
