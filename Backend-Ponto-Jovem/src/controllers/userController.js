import {
  createUserService,
  getUsersByIdService,
  authenticateUserService,
  updateUserService,
} from '../services/userService.js';

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();

  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

export const getUsersById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getUsersByIdService(id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar usuario por ID:', error.message);
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { nome, email, password, senha_hash, data_nascimento } = req.body;

    if (!nome || !email || !(password || senha_hash)) {
      return res.status(400).json({
        success: false,
        message: 'Nome, e-mail e senha são obrigatórios.',
      });
    }

    const normalizedDate = normalizeDate(data_nascimento);

    const userData = {
      nome,
      email,
      password: password || senha_hash,
      ...(normalizedDate ? { data_nascimento: normalizedDate } : {}),
    };

    const result = await createUserService(userData);

    if (result.success) {
      const user = {
        ...result.user,
        data_nascimento: result.user?.data_nascimento ?? normalizedDate ?? null,
      };
      res.status(201).json({
        success: true,
        data: user,
        message: result.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário: ' + error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    const result = await authenticateUserService(email, password);

    if (result.success) {
      const user = {
        ...result.user,
        data_nascimento:
          result.user?.data_nascimento ??
          result.user?.dataNascimento ??
          result.user?.birthDate ??
          null,
      };
      res.status(200).json({
        success: true,
        data: user,
        message: result.message,
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no login: ' + error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, data_nascimento } = req.body;

    const updates = {};
    if (nome) updates.nome = nome;
    if (email) updates.email = email;

    if (typeof data_nascimento !== 'undefined') {
      const normalizedDate = normalizeDate(data_nascimento);
      if (normalizedDate) {
        updates.data_nascimento = normalizedDate;
      } else if (data_nascimento === null || data_nascimento === '') {
        updates.data_nascimento = null;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Formato de data inválido. Use DD/MM/AAAA ou AAAA-MM-DD.',
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum dado para atualizar.' });
    }

    const result = await updateUserService(id, updates);

    if (result.success) {
      res.status(200).json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
};
