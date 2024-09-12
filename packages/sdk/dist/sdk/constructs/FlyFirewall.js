import { StackConstruct } from "../core/StackConstruct";
export class FlyFirewall extends StackConstruct {
    constructor(stack, id, props) {
        super(stack, id);
        this.rules = [];
        this.app = props.app;
    }
    addRule(rule) {
        this.rules.push(rule);
    }
    synthesize() {
        return {
            type: "firewall",
            appId: this.app.getId(),
            rules: this.rules.length > 0 ? this.rules : [
                {
                    action: "deny",
                    protocol: "tcp",
                    ports: "1-65535",
                    source: "0.0.0.0/0",
                    destination: "0.0.0.0/0",
                    description: "Default deny all traffic",
                    priority: 2000
                }
            ]
        };
    }
    validate() {
        return true;
    }
    getName() {
        return `${this.app.getId()}-firewall`;
    }
    clearRules() {
        this.rules = [];
    }
}
