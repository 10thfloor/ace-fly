export class ResourceReference {
    constructor(resource) {
        this.resource = resource;
    }
    getId() {
        return this.resource.getId();
    }
    getType() {
        return this.resource.constructor.name;
    }
    getResource() {
        return this.resource;
    }
    toString() {
        return `${this.getType()}:${this.getId()}`;
    }
}
