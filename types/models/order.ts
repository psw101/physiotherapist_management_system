import { Product } from './product';

// Base order interface with properties common to all orders
export interface Order {
  id: string;
  productId: number;
  product: Product;
  quantity: number;
  totalPrice: number;
  customizations: Record<string, string>;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin-specific order with additional user information
export interface AdminOrder extends Order {
  userId: string;
  user: {
    name: string;
    email: string;
  };
}
