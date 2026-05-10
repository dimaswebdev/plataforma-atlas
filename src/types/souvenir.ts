import { Timestamp } from "firebase/firestore";

export interface Souvenir {
  id?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  stock?: number;
  sizes?: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Order {
  id?: string;
  participantId?: string;
  buyerName: string;
  buyerPhone?: string;
  items: Array<{
    souvenirId: string;
    name: string;
    quantity: number;
    size?: string;
    unitPrice: number;
    subtotal: number;
  }>;
  total: number;
  paymentStatus: "pending" | "paid" | "cancelled";
  deliveryStatus: "pending" | "in_production" | "available" | "delivered";
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
