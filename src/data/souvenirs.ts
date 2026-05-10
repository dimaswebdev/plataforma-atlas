import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Souvenir } from "@/types/souvenir";
import { DEFAULT_EVENT_ID } from "@/lib/constants";

export async function getPublicSouvenirs(eventId: string = DEFAULT_EVENT_ID): Promise<Souvenir[]> {
  try {
    const q = query(
      collection(db, "events", eventId, "souvenirs"),
      where("available", "==", true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Souvenir));
  } catch (error) {
    console.error("Error fetching souvenirs:", error);
    return [];
  }
}
