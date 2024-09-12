import type { FlyStack } from "./FlyStack";
import "reflect-metadata";
import { ResourceReference } from "../utils/ResourceReference";
import type { ResourceOrReference } from "../../types";
export declare abstract class StackConstruct {
    protected stack: FlyStack;
    protected id: string;
    constructor(stack: FlyStack, id: string);
    initialize(): void;
    isValid(): boolean;
    protected getResource<T extends StackConstruct>(resourceOrRef: ResourceOrReference<T>): T;
    private addDependenciesToStack;
    private addDependency;
    getId(): string;
    abstract synthesize(): Record<string, any>;
    protected abstract validate(): boolean;
    protected abstract getName(): string;
    getReference(): ResourceReference<this>;
    static create<T extends StackConstruct>(this: new (stack: FlyStack, id: string, config: any) => T, stack: FlyStack, id: string, config: any): T;
    protected getStack(): FlyStack;
}
