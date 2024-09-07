import type { StackConstruct } from "./sdk/constructs/StackConstruct";
import { ResourceReference } from "./sdk/utils/ResourceReference";

export type ResourceOrReference<T extends StackConstruct> =
	| T
	| ResourceReference<T>;
