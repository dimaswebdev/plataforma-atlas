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
  category?: "kit" | "shirt" | "pants" | "mug" | "cap" | "patch" | "other";
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface SouvenirInterest {
  id?: string;
  participantId?: string;
  participantName: string;
  warName?: string;
  contactPhone?: string;
  contactEmail?: string;
  souvenirId: string;
  souvenirName: string;
  souvenirCategory?: Souvenir["category"];
  quantity: number;
  shirtSize?: string;
  pantsSize?: string;
  jacketSize?: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | "fulfilled";
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
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
