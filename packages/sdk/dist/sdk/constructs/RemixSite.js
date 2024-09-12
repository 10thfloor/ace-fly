import { StackConstruct } from "../core/StackConstruct";
import path from 'node:path';
export class RemixSite extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = {
            projectDir: config.projectDir,
            sourceDir: config.sourceDir || "app",
            buildCommand: config.buildCommand || "npm run build",
            startCommand: config.startCommand || "npm run start",
            nodeVersion: config.nodeVersion || "18",
            port: config.port || 3000,
            customEnv: config.customEnv || {},
        };
        this.initialize();
    }
    getInternalPort() {
        return this.config.port;
    }
    synthesize() {
        return {
            type: "remix-site",
            projectDir: this.config.projectDir,
            sourceDir: path.join(this.config.projectDir, this.config.sourceDir),
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
