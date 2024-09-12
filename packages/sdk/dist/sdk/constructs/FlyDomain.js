import { StackConstruct } from "../core/StackConstruct";
export class FlyDomain extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.initialize();
    }
    getDomainName() {
        return this.config.domainName;
    }
    synthesize() {
        return {
            type: "domain",
            name: this.config.name || this.getId(),
            domainName: this.config.domainName,
        };
    }
    validate() {
        return !!this.config.domainName;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
