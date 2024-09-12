import type { StackConstruct } from "./sdk/core/StackConstruct";
import type { ResourceReference } from "./sdk/utils/ResourceReference";

export type ResourceOrReference<T extends StackConstruct> =
	| T
	| ResourceReference<T>;
