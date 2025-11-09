import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../utils/auth';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const current = await auth.getCurrentUser();
      setSession(current);
      setReady(true);
    })();
  }, []);

  const login = async (u, p) => {
    const s = await auth.login(u, p);
    setSession(s);
  };

  const logout = async () => {
    await auth.logout();
    setSession(null);
  };

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
