var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { StackConstruct } from "../core/StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import { FlyHttpService } from "./FlyHttpService";
export class FlyAnycastIP extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.proxy = config.proxy;
        this.tls = config.tls;
        this.initialize();
    }
    synthesize() {
        const result = {
            type: "anycast-ip",
            name: this.config.name || this.getId(),
            ipType: this.config.type,
            shared: this.config.shared,
            proxy: this.getResource(this.proxy).getId(),
        };
        if (this.tls) {
            result.tls = this.getResource(this.tls).getId();
        }
        return result;
    }
    validate() {
        const proxyResource = this.getResource(this.proxy);
        if (proxyResource instanceof FlyHttpService && this.tls) {
            console.warn("TLS configuration is ignored when using HttpService as proxy.");
        }
        if (!(proxyResource instanceof FlyHttpService) && !this.tls) {
            console.warn("TLS configuration is recommended when not using HttpService as proxy.");
        }
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
__decorate([
    Dependency(),
    __metadata("design:type", Object)
], FlyAnycastIP.prototype, "proxy", void 0);
__decorate([
    Dependency(true),
    __metadata("design:type", Object)
], FlyAnycastIP.prototype, "tls", void 0);
