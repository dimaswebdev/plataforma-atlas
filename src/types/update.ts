import { Timestamp } from "firebase/firestore";

export interface Update {
  id?: string;
  title: string;
  content: string;
  isPinned: boolean;
  isPublic: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
