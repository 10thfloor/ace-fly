import type { StackConstruct } from "../core/StackConstruct";
export declare class ResourceReference<T extends StackConstruct> {
    private readonly resource;
    constructor(resource: T);
    getId(): string;
    getType(): string;
    getResource(): T;
    toString(): string;
}
