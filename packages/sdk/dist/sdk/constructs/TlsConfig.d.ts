import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../core/StackConstruct";
import type { ResourceOrReference } from "../../types";
import type { FlyCertificate } from "./FlyCertificate";
export interface ITlsConfig {
    name?: string;
    enabled: boolean;
    certificate: ResourceOrReference<FlyCertificate>;
    privateKey: string;
    alpn: string[];
    versions: string[];
}
export declare class TlsConfig extends StackConstruct {
    private config;
    constructor(stack: FlyStack, id: string, config: ITlsConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
