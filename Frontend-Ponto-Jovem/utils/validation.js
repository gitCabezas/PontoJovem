export const validation = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'E-mail é obrigatório';
    if (!emailRegex.test(email)) return 'E-mail inválido';
    return null;
  },
  password: (password) => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    return null;
  },
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Confirmação de senha é obrigatória';
    if (password !== confirmPassword) return 'Senhas não coincidem';
    return null;
  },
  required: (value, fieldName) => {
    if (!value || value.toString().trim() === '') return `${fieldName} é obrigatório`;
    return null;
  },
  date: (dateString) => {
    if (!dateString) return 'Data é obrigatória';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    const today = new Date();
    if (date > today) return 'Data não pode ser futura';
    const minDate = new Date(today.getFullYear() - 100, 0, 1);
    if (date < minDate) return 'Data muito antiga';
    return null;
  }
};
