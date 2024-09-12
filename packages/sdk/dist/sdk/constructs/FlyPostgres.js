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
export class FlyPostgres extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.password = this.getResource(config.credentials.password);
        this.replicas =
            config.replicas?.map((replica) => this.getResource(replica)) || [];
        this.initialize();
    }
    synthesize() {
        return {
            type: "postgres",
            name: this.config.name || this.getId(),
            region: this.config.region,
            instanceType: this.config.instanceType,
            storage: this.config.storage,
            replicas: this.replicas?.map((replica) => replica.getId()),
        };
    }
    validate() {
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
__decorate([
    Dependency(),
    __metadata("design:type", Function)
], FlyPostgres.prototype, "password", void 0);
__decorate([
    Dependency(true),
    __metadata("design:type", Array)
], FlyPostgres.prototype, "replicas", void 0);
