import { Timestamp } from "firebase/firestore";

export interface Transaction {
  id?: string;
  type: "income" | "expense";
  date: string;
  description: string;
  amount: number;
  category: "adesao" | "mensalidade" | "souvenir" | "buffet" | "salao" | "decoracao" | "som" | "foto_video" | "transporte" | "hotel" | "fornecedor" | "outros";
  participantId?: string;
  supplierId?: string;
  souvenirOrderId?: string;
  paymentMethod?: "pix" | "boleto" | "cartao" | "dinheiro" | "transferencia" | "outro";
  receiptUrl?: string;
  isPublic: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
