import type { FlyStack } from "../core/FlyStack";
export declare class ConfigurationSynthesizer {
    private processedResources;
    synthesize(stack: FlyStack): Record<string, any>;
    private resolveReferences;
}
