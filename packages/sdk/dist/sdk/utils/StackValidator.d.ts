import type { FlyStack } from "../core/FlyStack";
export declare class StackValidator {
    private stack;
    private errors;
    constructor(stack: FlyStack);
    validate(): boolean;
    private validateResource;
    private validateStackConstraints;
    private validateNoCyclicDependencies;
    getErrors(): string[];
}
