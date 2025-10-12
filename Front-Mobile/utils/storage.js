import AsyncStorage from '@react-native-async-storage/async-storage';

const getJSON = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setJSON = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const storage = {
  getSession: () => getJSON('session', null),
  setSession: (session) => setJSON('session', session),
  clearSession: () => AsyncStorage.removeItem('session'),

  getUsers: () => getJSON('users', []),
  addUser: async (user) => {
    const users = await storage.getUsers();
    users.push(user);
    await setJSON('users', users);
  },
  updateUser: async (username, updates) => {
    const users = await storage.getUsers();
    const i = users.findIndex(u => u.username === username);
    if (i !== -1) {
      users[i] = { ...users[i], ...updates };
      await setJSON('users', users);
      return true;
    }
    return false;
  },
  findUser: async (usernameOrEmail) => {
    const users = await storage.getUsers();
    return users.find(u => u.username === usernameOrEmail || u.email === usernameOrEmail);
  },

  getPunches: () => getJSON('punches', {}),
  setPunch: async (date, type, time) => {
    const punches = await storage.getPunches();
    punches[date] = punches[date] || {};
    punches[date][type] = time;
    await setJSON('punches', punches);
  },
  getPunchesForDate: async (date) => {
    const punches = await storage.getPunches();
    return punches[date] || {};
  }
};
