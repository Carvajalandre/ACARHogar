"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "./client";
import { doc, getDoc } from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  username: string;
  householdId: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  username: "",
  householdId: null,
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const fetchUserData = useCallback(async (firebaseUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUsername(data.username || firebaseUser.displayName || "");
        setHouseholdId(data.householdId || null);
      } else {
        setUsername(firebaseUser.displayName || "");
        setHouseholdId(null);
      }
    } catch {
      setUsername(firebaseUser.displayName || "");
      setHouseholdId(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (user) {
      await fetchUserData(user);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUsername("");
        setHouseholdId(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchUserData]);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, username, householdId, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);