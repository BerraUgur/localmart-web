import { CustomComment } from "./comment";

export interface Product {
    id?: number;
    name?: string;
    price?: number;
    discountedPrice?: number;
    stock?: number;
    description?: string;
    city?: string;
    district?: string;
    mainImage?: string;
    images?: string[];
    comments?: CustomComment[];
    sellerUserId?: number | any;
    sellerPhone:any;
}

export interface ProductRequest {
    name: string;
    price: number;
    discountedPrice: number;
    stock: number;
    description: string;
    city: string;
    district: string;
    mainImage: string;
    images: string[];
}

