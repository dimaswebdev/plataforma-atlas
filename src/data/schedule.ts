import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Schedule } from "@/types/schedule";
import { DEFAULT_EVENT_ID } from "@/lib/constants";

export async function getPublicSchedule(eventId: string = DEFAULT_EVENT_ID): Promise<Schedule[]> {
  try {
    const q = query(
      collection(db, "events", eventId, "schedule"),
      where("isPublic", "==", true)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
    
    // Sort client-side to avoid requiring a composite index in Firestore
    return data.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }
}
