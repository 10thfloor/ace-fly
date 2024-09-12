import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyHttpService } from "../constructs/FlyHttpService";
export interface ApiRoute {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    handlerFile: string;
}
export interface FlyApiProps {
    routes: ApiRoute[];
}
export declare class FlyApi extends StackConstruct {
    private routes;
    private httpService;
    private env;
    constructor(stack: FlyStack, id: string, props: FlyApiProps);
    getHttpService(): FlyHttpService;
    addEnv(key: string, value: string): void;
    validate(): boolean;
    getName(): string;
    getInternalPort(): number;
    synthesize(): Record<string, any>;
}
