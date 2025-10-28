import { Address } from "./address";
import { Product } from "./product";

export interface Order {
	id?: number;
	userId?: number;
	addressId?: number;
	orderDate?: string;
	note?: string;
	status?: string;
	orderItems: OrderItem[];
	address?: Address;
}

export interface OrderItem {
	productId?: number;
	quantity?: number;
	product: Product;
	status?: string;
}