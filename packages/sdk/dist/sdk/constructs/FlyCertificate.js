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
export class FlyCertificate extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.domains = config.domains.map((domain) => this.getResource(domain));
        this.initialize();
    }
    synthesize() {
        return {
            type: "certificate",
            name: this.config.name || this.getId(),
            domains: this.domains.map((domain) => domain.getDomainName()),
        };
    }
    validate() {
        return this.domains.length > 0;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
__decorate([
    Dependency(),
    __metadata("design:type", Array)
], FlyCertificate.prototype, "domains", void 0);
