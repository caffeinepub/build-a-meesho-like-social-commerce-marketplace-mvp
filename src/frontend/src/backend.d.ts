import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    price: number;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    total: number;
    userId: Principal;
    address?: string;
    items: Array<CartItem>;
}
export interface Category {
    id: bigint;
    name: string;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    shipped = "shipped",
    canceled = "canceled",
    pending = "pending",
    paid = "paid",
    delivered = "delivered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(title: string, description: string, price: number, category: string, imageUrl: string): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bootstrapAdmin(adminToken: string, userProvidedToken: string): Promise<void>;
    checkout(address: string | null, paymentMethod: string | null, message: string | null): Promise<bigint>;
    clearCart(): Promise<void>;
    createCategories(categories: Array<Category>): Promise<void>;
    createInitialMarketplace(products: Array<Product>, categories: Array<Category>): Promise<boolean>;
    deleteProduct(id: bigint): Promise<void>;
    editProduct(id: bigint, title: string, description: string, price: number, category: string, imageUrl: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllProductsSortedById(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getOrders(): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getProductsByCategorySortedByPrice(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
