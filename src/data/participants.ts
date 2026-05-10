import { collection, doc, setDoc, getDocs, getDoc, serverTimestamp, query, where, Timestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Participant } from "@/types/participant";
import { DEFAULT_EVENT_ID } from "@/lib/constants";

export async function createParticipant(data: Omit<Participant, "id" | "createdAt" | "updatedAt">, eventId: string = DEFAULT_EVENT_ID): Promise<string> {
  const participantsRef = collection(db, "events", eventId, "participants");
  const newParticipantRef = doc(participantsRef);
  
  await setDoc(newParticipantRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return newParticipantRef.id;
}

export async function getParticipants(eventId: string = DEFAULT_EVENT_ID): Promise<Participant[]> {
  const q = query(collection(db, "events", eventId, "participants"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Participant));
}

export async function getConfirmedParticipantsCount(eventId: string = DEFAULT_EVENT_ID): Promise<number> {
  try {
    const q = query(
      collection(db, "events", eventId, "participants"),
      where("willAttend", "==", "yes")
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (error) {
    return 0;
  }
}

export async function updateParticipantPayment(
  participantId: string, 
  status: "not_started" | "partial" | "paid" | "overdue", 
  eventId: string = DEFAULT_EVENT_ID
) {
  const pRef = doc(db, "events", eventId, "participants", participantId);
  await updateDoc(pRef, {
    paymentStatus: status,
    updatedAt: serverTimestamp()
  });
}

export async function deleteParticipant(participantId: string, eventId: string = DEFAULT_EVENT_ID) {
  const pRef = doc(db, "events", eventId, "participants", participantId);
  await deleteDoc(pRef);
}
