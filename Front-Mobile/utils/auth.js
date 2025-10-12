import { storage } from './storage';

const API_URL = 'http://localhost:3000/bk-mobile'; 


const simpleHash = (password) => password.split('').reverse().join('') + '|h';

//  Converte data DD-MM-AAAA → YYYY-MM-DD
const formatDate = (input) => {
  if (!input) return null;
  const [day, month, year] = input.split('-');
  if (!day || !month || !year) throw new Error('Formato de data inválido. Use DD-MM-AAAA');
  return `${year}-${month}-${day}`;
};

export const auth = {
  // --- LOGIN VIA BACKEND ---
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      return data.data; // retorna o objeto do usuário autenticado (sem senha)
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error('Falha ao conectar ao servidor. Verifique sua rede.');
    }
  },

  // --- CADASTRO VIA BACKEND ---
  register: async ({ username, email, birthDate, password }) => {
    const formattedDate = formatDate(birthDate);

    const response = await fetch(`${API_URL}/usuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: username,
        email: email,
        senha_hash: password,
        data_nascimento: formattedDate
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar usuário');
    }

    return data.data;
  },

  // --- RESET LOCAL (mantido por compatibilidade se usar armazenamento offline) ---
  resetPassword: async (usernameOrEmail, newPassword) => {
    const user = await storage.findUser(usernameOrEmail);
    if (!user) throw new Error('Usuário não encontrado');
    return storage.updateUser(user.username, { passwordHash: simpleHash(newPassword) });
  },

  logout: async () => storage.clearSession(),
  getCurrentUser: async () => storage.getSession(),
  isAuthenticated: async () => !!(await storage.getSession())
};
