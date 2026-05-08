import { collection, doc, addDoc, getDoc, getDocs, query, where, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./client";

export interface Home {
  id: string;
  name: string;
  joinCode: string;
  members: string[]; // User IDs
}

// Generates a random 6-digit code
function generateJoinCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createHome(name: string, userId: string): Promise<string> {
  const joinCode = generateJoinCode();
  
  // Ensure the code is unique
  const q = query(collection(db, "homes"), where("joinCode", "==", joinCode));
  const snap = await getDocs(q);
  if (!snap.empty) {
    // If it exists (very rare), just call recursively
    return createHome(name, userId);
  }

  const homesRef = collection(db, "homes");
  const docRef = await addDoc(homesRef, {
    name,
    joinCode,
    members: [userId],
    createdAt: new Date(),
  });

  // Update user with the new householdId
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    householdId: docRef.id
  });

  return docRef.id;
}

export async function joinHome(joinCode: string, userId: string): Promise<{ success: boolean; error?: string; homeId?: string }> {
  const q = query(collection(db, "homes"), where("joinCode", "==", joinCode));
  const snap = await getDocs(q);

  if (snap.empty) {
    return { success: false, error: "Código inválido o el hogar no existe." };
  }

  const homeDoc = snap.docs[0];
  const homeRef = doc(db, "homes", homeDoc.id);

  // Add user to home members
  await updateDoc(homeRef, {
    members: arrayUnion(userId)
  });

  // Update user with the new householdId
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    householdId: homeDoc.id
  });

  return { success: true, homeId: homeDoc.id };
}

export async function getHomeDetails(homeId: string): Promise<Home | null> {
  const homeDoc = await getDoc(doc(db, "homes", homeId));
  if (!homeDoc.exists()) return null;
  return { id: homeDoc.id, ...homeDoc.data() } as Home;
}

export async function getHomeMembers(homeId: string) {
  const home = await getHomeDetails(homeId);
  if (!home || !home.members.length) return [];

  // Assuming members array is not huge, we can fetch their details
  const membersData = [];
  // For larger arrays, we'd use 'in' queries, but 'in' is limited to 10 items.
  for (const userId of home.members) {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      membersData.push({ id: userDoc.id, ...userDoc.data() });
    }
  }
  
  return membersData;
}
