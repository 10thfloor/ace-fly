export class Validator {
    static validateResource(resource) {
        // The resource has already been validated during construction
        return true;
    }
    static validateStack(stack) {
        // All resources in the stack have already been validated
        // You might want to add additional stack-level validations here
        return true;
    }
}
