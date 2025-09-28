import supabase from "../config/supabaseClient.js";

// Função para buscar usuario por id
export const getUsersByIdService = async (id) => {
    try {
        const {data, error} = await supabase.from('table_usuario').select('*').eq('id_usuario',id).single();
        if (error) throw new Error('Usuario não encontrado');
        return data;
    } catch (error) {
        console.error('Erro ao buscar usuario por ID:', error.message);
        throw new Error('Erro ao buscar usuario por ID');
    }
};

// Função para criar usuário
export const createUserService = async (userData) => {
    try {
        // Verifica se usuário já existe
        const { data: existingUser, error: checkError } = await supabase
            .from('table_usuario')
            .select('email')
            .eq('email', userData.email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw new Error('Erro ao verificar email: ' + checkError.message);
        }

        if (existingUser) {
            throw new Error('Email já cadastrado');
        }

        const user = {
            nome: userData.nome,
            email: userData.email,
            senha_hash: userData.password || userData.senha_hash,
        };

        const { data, error } = await supabase
            .from('table_usuario')
            .insert([user])
            .select();

        if (error) throw new Error(error.message);
        
        return {
            success: true,
            user: data[0],
            message: 'Usuário criado com sucesso'
        };
    } catch (error) {
        return {
            success: false,
            user: null,
            message: error.message
        };
    }
};

// Função para autenticar usuário (login)
export const authenticateUserService = async (email, password) => {
    try {
        const { data: user, error } = await supabase
            .from('table_usuario')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            throw new Error('Email ou senha incorretos');
        }

        if (user.senha_hash !== password) {
            throw new Error('Email ou senha incorretos');
        }

        const { senha_hash, ...userWithoutPassword } = user;
        
        return {
            success: true,
            user: userWithoutPassword,
            message: 'Login realizado com sucesso'
        };
    } catch (error) {
        return {
            success: false,
            user: null,
            message: error.message
        };
    }
};