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
export class FlyMachine extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.autoScaling = this.getResource(config.autoScaling);
        this.link = config.link?.map((db) => this.getResource(db)) || [];
        this.machineConfig = this.getResource(config.machineConfig);
        this.initialize();
    }
    synthesize() {
        return {
            type: "machine",
            name: this.config.name || this.getId(),
            count: this.config.count,
            regions: this.config.regions,
            autoScaling: this.autoScaling.getId(),
            link: this.link?.map((db) => db.getId()) || [],
            machineConfig: this.machineConfig.getId(),
        };
    }
    getInternalPort() {
        return this.machineConfig.getInternalPort();
    }
    validate() {
        // Implement validation logic
        return true;
    }
    addLink(database) {
        this.link = [...(this.link || []), this.getResource(database)];
    }
    getName() {
        return this.config.name || this.getId();
    }
}
__decorate([
    Dependency(),
    __metadata("design:type", Function)
], FlyMachine.prototype, "autoScaling", void 0);
__decorate([
    Dependency(true),
    __metadata("design:type", Array)
], FlyMachine.prototype, "link", void 0);
__decorate([
    Dependency(),
    __metadata("design:type", Function)
], FlyMachine.prototype, "machineConfig", void 0);
