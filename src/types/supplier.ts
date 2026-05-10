import { Timestamp } from "firebase/firestore";

export interface Supplier {
  id?: string;
  name: string;
  service: string;
  contactName?: string;
  phone?: string;
  email?: string;
  contractValue: number;
  paidAmount: number;
  status: "cotacao" | "contratado" | "pago_parcial" | "quitado" | "cancelado";
  notes?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
