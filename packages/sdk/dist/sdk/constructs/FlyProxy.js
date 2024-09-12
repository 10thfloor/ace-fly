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
export class FlyProxy extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.machines = config.machines;
        this.ports = config.ports;
        this.loadBalancing = config.loadBalancing;
        this.config = config;
        this.initialize();
    }
    synthesize() {
        return {
            type: "proxy",
            name: this.config.name || this.getId(),
            machines: Object.fromEntries(Object.entries(this.machines).map(([key, machine]) => [
                key,
                this.getResource(machine).getId(),
            ])),
            ports: this.ports,
            loadBalancing: this.getResource(this.loadBalancing).getId(),
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
    __metadata("design:type", Object)
], FlyProxy.prototype, "machines", void 0);
__decorate([
    Dependency(),
    __metadata("design:type", Object)
], FlyProxy.prototype, "loadBalancing", void 0);
