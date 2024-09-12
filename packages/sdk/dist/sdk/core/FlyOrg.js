var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
export class FlyOrg extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.apps = [];
        this.config = config;
        this.initialize();
    }
    addApp(app) {
        this.apps.push(app);
    }
    deploy() {
        // TODO: Implement
    }
    synthesize() {
        return {
            type: "organization",
            name: this.config.name,
            apps: this.apps.map(app => app.getId()),
        };
    }
    validate() {
        return !!this.config.name;
    }
    getName() {
        return this.config.name;
    }
}
__decorate([
    Dependency(),
    __metadata("design:type", Array)
], FlyOrg.prototype, "apps", void 0);
