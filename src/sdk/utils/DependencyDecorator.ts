import "reflect-metadata";

export function Dependency(optional: boolean = false) {
	return function (target: Object, propertyKey: string | symbol): void {
		if (
			!Reflect.hasMetadata("dependencyProperties", target.constructor.prototype)
		) {
			Reflect.defineMetadata(
				"dependencyProperties",
				new Map<string | symbol, boolean>(),
				target.constructor.prototype,
			);
		}
		const dependencyProperties = Reflect.getMetadata(
			"dependencyProperties",
			target.constructor.prototype,
		) as Map<string | symbol, boolean>;
		dependencyProperties.set(propertyKey, optional);
	};
}
