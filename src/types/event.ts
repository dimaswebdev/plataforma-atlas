import { Timestamp } from "firebase/firestore";

export interface Event {
  id?: string;
  title: string;
  subtitle: string;
  city: string;
  eventMonth: string;
  eventYear: number;
  mainDate?: string;
  status: "planning" | "open" | "closed" | "completed";
  budgetGoal: number;
  publicPaymentLink?: string;
  whatsappGroupLink?: string;
  officialEmail?: string;
  heroDescription?: string;
  badgeUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
