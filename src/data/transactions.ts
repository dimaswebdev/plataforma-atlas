import { collection, query, where, getDocs, orderBy, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction } from "@/types/transaction";
import { DEFAULT_EVENT_ID } from "@/lib/constants";

export async function getPublicTransactions(eventId: string = DEFAULT_EVENT_ID): Promise<Transaction[]> {
  try {
    const q = query(
      collection(db, "events", eventId, "transactions"),
      where("isPublic", "==", true),
    );
    // Ideally we would orderBy createdAt, but need a composite index for where + orderBy.
    // For now we fetch and sort client side if needed, or assume default order is fine.
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  } catch (error) {
    console.error("Error fetching transactions", error);
    return [];
  }
}

export async function getFinancialSummary(eventId: string = DEFAULT_EVENT_ID) {
  try {
    // For a real MVP, we might fetch all transactions or maintain a running total in the event doc.
    // Here we will fetch all public transactions and compute total.
    const q = query(
      collection(db, "events", eventId, "transactions"),
      where("isPublic", "==", true)
    );
    const snap = await getDocs(q);
    let income = 0;
    let expense = 0;

    snap.docs.forEach(doc => {
      const data = doc.data() as Transaction;
      if (data.type === "income") income += data.amount;
      if (data.type === "expense") expense += data.amount;
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  } catch (error) {
    return { totalIncome: 0, totalExpense: 0, balance: 0 };
  }
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">, eventId: string = DEFAULT_EVENT_ID) {
  try {
    const docRef = await addDoc(collection(db, "events", eventId, "transactions"), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating transaction", error);
    throw error;
  }
}

export async function deleteTransaction(transactionId: string, eventId: string = DEFAULT_EVENT_ID) {
  try {
    await deleteDoc(doc(db, "events", eventId, "transactions", transactionId));
  } catch (error) {
    console.error("Error deleting transaction", error);
    throw error;
  }
}
