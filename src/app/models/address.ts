import { User } from "./comment";

export interface Address {
	id?: number;
	userId?: number;
	openAddress?: string;
	city?: string;
	district?: string;
	postalCode?: string;
	user?: User;
}