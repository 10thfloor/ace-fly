import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyCertificate } from "./FlyCertificate";
import type { FlySecret } from "./FlySecret";
import type { FlyAnycastIP } from "./FlyAnycastIP";
import type { FlyProxy } from "./FlyProxy";
import type { FlyDomain } from "./FlyDomain";
import type { ResourceOrReference } from "../../types";
import type { FlyHttpService } from "./FlyHttpService";
export interface IFlyAppConfig {
    name: string;
    domain: ResourceOrReference<FlyDomain>;
    certificate: ResourceOrReference<FlyCertificate>;
    secrets: ResourceOrReference<FlySecret>[];
    env: Record<string, string>;
    regions: string[];
    publicServices: {
        [name: string]: ResourceOrReference<FlyAnycastIP | FlyProxy | FlyHttpService>;
    };
    privateServices: {
        [name: string]: ResourceOrReference<FlyProxy>;
    };
}
export declare class FlyIoApp extends StackConstruct {
    private domain;
    private certificate;
    private secrets;
    private publicServices;
    private privateServices;
    private config;
    private regions;
    constructor(stack: FlyStack, id: string, config: IFlyAppConfig);
    synthesize(): Record<string, any>;
    addPublicService(name: string, service: ResourceOrReference<FlyAnycastIP | FlyProxy | FlyHttpService>): void;
    addPrivateService(name: string, service: ResourceOrReference<FlyProxy>): void;
    protected validate(): boolean;
    protected getName(): string;
    addSecret(secret: FlySecret): void;
    getRegions(): string[];
    getId(): string;
}
