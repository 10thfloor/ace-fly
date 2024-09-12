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
export class FlyIoApp extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.domain = this.getResource(config.domain);
        this.certificate = this.getResource(config.certificate);
        this.secrets = config.secrets.map((secret) => this.getResource(secret));
        this.publicServices = Object.fromEntries(Object.entries(config.publicServices).map(([key, service]) => [
            key,
            this.getResource(service),
        ]));
        this.privateServices = Object.fromEntries(Object.entries(config.privateServices).map(([key, service]) => [
            key,
            this.getResource(service),
        ]));
        this.regions = config.regions || [];
        this.initialize();
    }
    synthesize() {
        return {
            type: "app",
            name: this.config.name || this.getId(),
            domain: this.domain,
            certificate: this.certificate.getId(),
            secrets: this.secrets.map((secret) => secret.getId()),
            publicServices: Object.fromEntries(Object.entries(this.publicServices).map(([key, service]) => [
                key,
                service.getId(),
            ])),
            privateServices: Object.fromEntries(Object.entries(this.privateServices).map(([key, service]) => [
                key,
                service.getId(),
            ])),
        };
    }
    addPublicService(name, service) {
        this.publicServices[name] = service;
    }
    addPrivateService(name, service) {
        this.privateServices[name] = service;
    }
    validate() {
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
    addSecret(secret) {
        this.secrets.push(secret);
    }
    getRegions() {
        return this.regions;
    }
    getId() {
        return super.getId();
    }
}
__decorate([
    Dependency(),
    __metadata("design:type", Object)
], FlyIoApp.prototype, "domain", void 0);
__decorate([
    Dependency(),
    __metadata("design:type", Object)
], FlyIoApp.prototype, "certificate", void 0);
__decorate([
    Dependency(),
    __metadata("design:type", Array)
], FlyIoApp.prototype, "secrets", void 0);
__decorate([
    Dependency(),
    __metadata("design:type", Object)
], FlyIoApp.prototype, "publicServices", void 0);
__decorate([
    Dependency(),
    __metadata("design:type", Object)
], FlyIoApp.prototype, "privateServices", void 0);
