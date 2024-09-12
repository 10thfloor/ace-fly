import type { FlyApplication } from "../patterns/FlyApplication";
import type { FlyApiClient } from "../api/FlyApiClient";
import { type Middleware } from "../middleware/DeploymentPipeline";
export declare class FlyDeployment {
    private apiClient;
    private pipeline;
    private middlewares;
    constructor(apiClient: FlyApiClient);
    private setupDefaultMiddlewares;
    addMiddleware(name: string, middleware: Middleware, dependencies?: string[], priority?: number): void;
    private buildPipeline;
    private shouldIncludeMiddleware;
    deploy(app: FlyApplication): Promise<void>;
}
