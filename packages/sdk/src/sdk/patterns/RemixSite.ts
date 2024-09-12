import { FlyMachine, IFlyMachineProps } from "../constructs/FlyMachine";
import { FlyMachineConfig } from "../constructs/FlyMachineConfig";
import type { FlyStack } from "../core/FlyStack";
import { FlyRegion } from "../types/FlyRegions";

interface RemixSiteProps {
  name: string;
  projectDir: string;
}

export class RemixSite extends FlyMachine {
  private projectDir: string;

  constructor(stack: FlyStack, id: string, props: RemixSiteProps) {

    // TODO: Make this configurable
    const machineConfig = new FlyMachineConfig(stack, `${id}-config`, {
      cpus: 1,
      memoryMB: 256,
      image: "remix:latest", // Adjust as needed
      cmd: ["npm", "start"],
      env: {
        PORT: "{{ .internalPort }}",
        NODE_ENV: "production",
      },
      guest: {
        cpu_kind: "shared",
        memory_mb: 256,
      },
      internalPort: 3000,
    });

    super(stack, id, {
      ...props,
      name: props.name,
      machineConfig,
      regions: [FlyRegion.WASHINGTON_DC],
      count: 1,
    });

    this.projectDir = props.projectDir;
  }

  synthesize(): Record<string, any> {
    return {
      ...super.synthesize(),
      projectDir: this.projectDir,
    };
  }
}