import { StackConstruct } from "../core/StackConstruct";
export class TlsConfig extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.initialize();
    }
    synthesize() {
        return {
            type: "tls-config",
            name: this.config.name || this.getId(),
            enabled: this.config.enabled,
            certificate: this.config.certificate,
            alpn: this.config.alpn,
            versions: this.config.versions,
            privateKey: this.config.privateKey,
        };
    }
    validate() {
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
