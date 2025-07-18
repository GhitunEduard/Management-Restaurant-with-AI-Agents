// Order models for the Order Management component
export interface OrderItemDTO {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  priceAtOrder?: number;
}

export interface OrderDTO {
  id?: number;
  orderDate?: string;
  totalAmount?: number;
  customerName: string;
  customerAddress: string;
  orderItems?: OrderItemDTO[];
}

export interface CreateOrderRequest {
  customerName: string;
  customerAddress: string;
  items: OrderItemRequestDTO[];
}

export interface OrderItemRequestDTO {
  productId: number;
  quantity: number;
}

export interface OrderStatus {
  PENDING: 'PENDING';
  CONFIRMED: 'CONFIRMED';
  PREPARING: 'PREPARING';
  READY: 'READY';
  DELIVERED: 'DELIVERED';
  CANCELLED: 'CANCELLED';
}

export const ORDER_STATUS: OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};
