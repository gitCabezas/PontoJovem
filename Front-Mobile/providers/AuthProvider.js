import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../utils/auth';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  // Carrega usuário salvo no AsyncStorage ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSession(parsed);
        }
      } catch (err) {
        console.error('Erro ao carregar sessão:', err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Login via backend e salva no AsyncStorage
  const login = async (email, password) => {
    const userData = await auth.login(email, password);
    setSession(userData);
    await AsyncStorage.setItem('@session', JSON.stringify(userData));
  };

  // Logout e limpa tudo
  const logout = async () => {
    await auth.logout();
    setSession(null);
    await AsyncStorage.removeItem('@session');
  };

  // Atualiza dados do usuário via backend
  const refreshUser = async () => {
    if (!session?.id_usuario) return;
    try {
      const response = await fetch(`http://10.0.2.2:3000/bk-mobile/usuario/${session.id_usuario}`);
      const data = await response.json();
      setSession(data);
      await AsyncStorage.setItem('@session', JSON.stringify(data));
    } catch (err) {
      console.error('Erro ao atualizar dados do usuário:', err);
    }
  };

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ session, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
