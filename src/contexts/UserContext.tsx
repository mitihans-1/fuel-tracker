"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface UserData {
  id: string;
  role: string;
  name?: string;
  email?: string;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  clear: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  clear: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser({ 
          id: data._id ?? data.id, 
          role: data.role,
          name: data.name,
          email: data.email
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const clear = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh: fetchUser, clear }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
