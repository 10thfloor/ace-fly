import "reflect-metadata";
export function Dependency(optional = false) {
    return function (target, propertyKey) {
        if (!Reflect.hasMetadata("dependencyProperties", target.constructor.prototype)) {
            Reflect.defineMetadata("dependencyProperties", new Map(), target.constructor.prototype);
        }
        const dependencyProperties = Reflect.getMetadata("dependencyProperties", target.constructor.prototype);
        dependencyProperties.set(propertyKey, optional);
    };
}
