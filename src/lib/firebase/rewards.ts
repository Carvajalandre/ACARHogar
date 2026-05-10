import { collection, addDoc, doc, getDocs, query, where, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "./client";

export type RewardType = "reward" | "punishment";

export interface Reward {
  id?: string;
  title: string;
  description?: string;
  cost: number;
  type: RewardType;
  householdId: string;
  createdBy: string;
  createdAt: any;
}

export async function createReward(reward: Omit<Reward, "id" | "createdAt">) {
  const rewardsRef = collection(db, "rewards");
  const docRef = await addDoc(rewardsRef, {
    ...reward,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function deleteReward(rewardId: string) {
  const rewardRef = doc(db, "rewards", rewardId);
  await deleteDoc(rewardRef);
}

export async function getHouseholdRewards(householdId: string) {
  const q = query(collection(db, "rewards"), where("householdId", "==", householdId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
}
