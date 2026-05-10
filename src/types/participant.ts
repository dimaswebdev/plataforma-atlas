import { Timestamp } from "firebase/firestore";

export interface Participant {
  id?: string;
  name: string;
  nickname?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  linkedin?: string;
  birthDate?: string; // YYYY-MM-DD
  currentFunction?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
  isFromOutOfState: boolean;
  willAttend: "yes" | "maybe" | "no";
  guestsCount: number;
  needsHotelInfo: boolean;
  needsTransportInfo: boolean;
  wantsToHelpCommittee?: boolean;
  paymentStatus: "not_started" | "partial" | "paid" | "overdue";
  totalPaid: number;
  notes?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Guest {
  id?: string;
  participantId: string;
  name: string;
  type: "adult" | "child" | "teen";
  notes?: string;
  createdAt: Timestamp | Date;
}
