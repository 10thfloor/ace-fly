import { StackConstruct } from "../core/StackConstruct";
export class ArcJetProtection extends StackConstruct {
    constructor(stack, id, app, config) {
        super(stack, id);
        this.app = app;
        this.config = config;
    }
    synthesize() {
        return {
            type: "arcjet-protection",
            appId: this.app.getId(),
            apiKey: this.config.apiKey,
            rules: this.config.rules,
        };
    }
    validate() {
        // Add validation logic for ArcJet configuration
        return true;
    }
    getName() {
        return `${this.app.getId()}-arcjet-protection`;
    }
}
