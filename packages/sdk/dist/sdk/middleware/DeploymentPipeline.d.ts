import type { FlyApplication } from "../patterns/FlyApplication";
export interface DeploymentContext {
    app: FlyApplication;
    config: any;
}
export interface Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class DeploymentPipeline {
    private middlewares;
    private middlewareNames;
    use(middleware: Middleware, name: string): void;
    hasMiddleware(name: string): boolean;
    run(context: DeploymentContext): Promise<void>;
    private composeMiddleware;
}
export declare class ConfigurationLoader implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class EnvironmentValidator implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class SecretManager implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class ResourceInitializer implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class DatabaseSetup implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class ServiceConfigurator implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class NetworkingConfigurator implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class ScalingConfigurator implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class FirewallConfigurator implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class ObservabilitySetup implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
export declare class DeploymentStrategy implements Middleware {
    process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}
