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
  officialKit?: {
    interest: "yes" | "maybe" | "no";
    shirtSize?: "PP" | "P" | "M" | "G" | "GG" | "XG" | "XGG" | "SPECIAL";
    jacketSize?: "PP" | "P" | "M" | "G" | "GG" | "XG" | "XGG" | "SPECIAL";
    pantsSize?: "PP" | "P" | "M" | "G" | "GG" | "XG" | "XGG" | "SPECIAL";
    heightCm?: number;
    approximateWeightKg?: number;
    usualShirtSize?: string;
    usualPantsSize?: string;
    needsSpecialSize?: boolean;
    wantsNameCustomization?: boolean;
    customizationName?: string;
    additionalKitsInterest?: "yes" | "maybe" | "no";
    additionalKitsNotes?: string;
    notes?: string;
  };
  termsAcceptance?: {
    adhesionTermAccepted: boolean;
    privacyPolicyAccepted: boolean;
    platformTermsAccepted: boolean;
    financialTermsAccepted: boolean;
    imageUseAuthorized: boolean;
    souvenirsInfoAccepted: boolean;
    acceptedAt: Timestamp | Date | string;
    userAgent?: string;
    adhesionTermVersion: string;
    privacyPolicyVersion: string;
    platformTermsVersion: string;
    financialTermsVersion: string;
    imageUseTermVersion: string;
    souvenirsTermVersion: string;
  };
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
}

export interface Guest {
  id?: string;
  participantId: string;
  name: string;
  type: "adult" | "child" | "teen";
  notes?: string;
  createdAt: Timestamp | Date;
}
