import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "./client";

export async function getUserData(userId: string) {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() };
}

export async function updateUserPoints(userId: string, pointsDiff: number) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    points: increment(pointsDiff)
  });
}
