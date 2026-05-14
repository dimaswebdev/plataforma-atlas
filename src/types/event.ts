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
  eventPhase?: "interest" | "committee" | "voting" | "budgeting" | "payment" | "adjustment" | "closed" | "post_event";
  featureFlags?: {
    participantPortal?: boolean;
    payments?: boolean;
    asaas?: boolean;
    voting?: boolean;
    requests?: boolean;
  };
  deadlines?: {
    guestFreeChangeUntil?: string;
    guestApprovalChangeUntil?: string;
    souvenirInterestUntil?: string;
    paymentDueAt?: string;
    withdrawalUntil?: string;
  };
  financeConfig?: {
    costsDefined: boolean;
    baseQuota?: number;
    extraGuestQuota?: number;
    optionalItemsEnabled?: boolean;
    calculationVersion?: string;
  };
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
