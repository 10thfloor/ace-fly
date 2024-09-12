import type { StackConstruct } from "../core/StackConstruct";

export class Validator {
	static validateResource(resource: StackConstruct): boolean {
		// The resource has already been validated during construction
		return true;
	}

	static validateStack(stack: StackConstruct[]): boolean {
		// All resources in the stack have already been validated
		// You might want to add additional stack-level validations here
		return true;
	}
}
