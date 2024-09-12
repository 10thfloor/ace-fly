import type { StackConstruct } from "../core/StackConstruct";
export declare class Validator {
    static validateResource(resource: StackConstruct): boolean;
    static validateStack(stack: StackConstruct[]): boolean;
}
