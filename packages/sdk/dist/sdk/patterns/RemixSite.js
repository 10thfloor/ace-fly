import { StackConstruct } from "../core/StackConstruct";
export class RemixSite extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.internalPort = 3000; // Default port for Remix apps
    }
    getInternalPort() {
        return this.internalPort;
    }
    synthesize() {
        return {
            type: "remix-site",
            projectDir: this.config.projectDir,
            sourceDir: this.config.sourceDir,
            buildCommand: this.config.buildCommand,
            startCommand: this.config.startCommand,
            nodeVersion: this.config.nodeVersion,
            port: this.config.port,
            customEnv: this.config.customEnv,
        };
    }
    validate() {
        // Basic validation
        return !!this.config.projectDir;
    }
    getName() {
        return this.getId();
    }
}
