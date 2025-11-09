
import { storage } from './storage';
import { getApiBase } from '../utils/api';

export const auth = {
  login: async (email, password) => {
    try {
      const base = await getApiBase();
      const response = await fetch(`${base}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erro ao fazer login');
      }

      const userData = result.data;
      await storage.setSession(userData);
      return userData;
    } catch (error) {
      throw new Error(error.message || 'Falha na comunicação com o servidor');
    }
  },

  register: async ({ nome, email, senha, data_nascimento }) => {
    try {
      const base = await getApiBase();
      const response = await fetch(`${base}/usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          senha_hash: senha,
          data_nascimento,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erro ao cadastrar usuário');
      }

      const userData = result.data;
      await storage.setSession(userData);
      return userData;
    } catch (error) {
      throw new Error(error.message || 'Falha na comunicação com o servidor');
    }
  },

  logout: async () => storage.clearSession(),
  getCurrentUser: async () => storage.getSession(),
  isAuthenticated: async () => !!(await storage.getSession()),
};
