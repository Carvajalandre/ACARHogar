import { collection, addDoc, doc, getDocs, query, where, Timestamp, deleteDoc, updateDoc } from "firebase/firestore";
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
  
  // Clean undefined properties
  const cleanData: any = {
    title: reward.title,
    cost: reward.cost,
    type: reward.type,
    householdId: reward.householdId,
    createdBy: reward.createdBy,
    createdAt: Timestamp.now(),
  };
  
  if (reward.description !== undefined) {
    cleanData.description = reward.description;
  }

  const docRef = await addDoc(rewardsRef, cleanData);
  return docRef.id;
}

export async function deleteReward(rewardId: string) {
  const rewardRef = doc(db, "rewards", rewardId);
  await deleteDoc(rewardRef);
}

export async function updateReward(rewardId: string, updates: Partial<Omit<Reward, "id" | "createdAt" | "householdId" | "createdBy">>) {
  const rewardRef = doc(db, "rewards", rewardId);
  
  // Clean undefined properties
  const cleanUpdates: any = {};
  if (updates.title !== undefined) cleanUpdates.title = updates.title;
  if (updates.description !== undefined) cleanUpdates.description = updates.description;
  if (updates.cost !== undefined) cleanUpdates.cost = updates.cost;
  if (updates.type !== undefined) cleanUpdates.type = updates.type;

  await updateDoc(rewardRef, cleanUpdates);
}

export interface Redemption {
  id?: string;
  rewardId: string;
  rewardTitle: string;
  rewardType: RewardType;
  cost: number;
  userId: string;
  userName: string;
  householdId: string;
  createdAt: any;
}

export async function createRedemption(redemption: Omit<Redemption, "id" | "createdAt">) {
  const redemptionsRef = collection(db, "redemptions");
  const docRef = await addDoc(redemptionsRef, {
    ...redemption,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getHouseholdRewards(householdId: string) {
  const q = query(collection(db, "rewards"), where("householdId", "==", householdId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
}
