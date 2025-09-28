import { createUserService, getUsersByIdService, authenticateUserService } from '../services/userService.js';

export const getUsersById = async (req,res) => {
    try {
        const {id} = req.params;
        const data = await getUsersByIdService(id);
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar usuario por ID:', error.message);
        res.status(404).json({error: error.message});
    }
};

export const createUser = async (req, res) => {
    try {
        const { nome, email, password, senha_hash } = req.body;
        
        const userData = {
            nome,
            email,
            password: password || senha_hash
        };

        const result = await createUserService(userData);
        
        if (result.success) {
            res.status(201).json({
                success: true,
                data: result.user,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar usuário: ' + error.message
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }

        const result = await authenticateUserService(email, password);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                data: result.user,
                message: result.message
            });
        } else {
            res.status(401).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro no login: ' + error.message
        });
    }
};