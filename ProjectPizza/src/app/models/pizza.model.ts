export interface Pizza {
  id: number;
  name: string;
  ingredients?: string[];
  price: number;
  imageUrl?: string;
  available?: boolean;
}

export interface CartItem {
  pizzaId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cartItemId?: number; // Unique ID for each cart item
}

export interface Order {
  orderId?: string;
  customer: string;
  phone: string;
  address: string;
  priority: boolean;
  cart: CartItem[];
  position?: string;
  status?: string;
  estimatedDelivery?: string;
}

export interface OrderResponse {
  status: string;
  orderId: string;
}
