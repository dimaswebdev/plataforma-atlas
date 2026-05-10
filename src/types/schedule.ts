import { Timestamp } from "firebase/firestore";

export interface Schedule {
  id?: string;
  date: string;
  title: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  order: number;
  isPublic: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
