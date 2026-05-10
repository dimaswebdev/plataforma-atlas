import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event } from "@/types/event";
import { DEFAULT_EVENT_ID } from "@/lib/constants";

export async function getEventData(eventId: string = DEFAULT_EVENT_ID): Promise<Event | null> {
  try {
    const docRef = doc(db, "events", eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Event;
    }
    return null;
  } catch (error) {
    console.error("Error fetching event data:", error);
    return null;
  }
}
