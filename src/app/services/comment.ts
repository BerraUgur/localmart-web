import { Product } from "./product";

export interface CustomComment {
    id?: number;
    content?: string;
    productId?: number;
    userId?: number;
    user?: User;
    product?: Product;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: Role | any;
    status: boolean;
    comments: Comment[];
}

export enum Role {

    User = "User",
    Seller = "Seller",
    Admin = "Admin"
}