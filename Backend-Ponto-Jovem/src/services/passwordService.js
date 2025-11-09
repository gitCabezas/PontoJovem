
import supabase from "../config/supabaseClient.js";
import crypto from 'crypto';
import { sendPasswordResetEmail } from './emailService.js';


const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};


export const requestPasswordResetService = async (email) => {
    try {
        console.log('📨 Iniciando recuperação para:', email);


        const { data: user, error } = await supabase
            .from('table_usuario')
            .select('id_usuario, email, nome')
            .eq('email', email)
            .single();

        if (error || !user) {
            console.log('❌ Usuário não encontrado:', email);
            return {
                success: true,
                message: 'Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.'
            };
        }

        console.log('✅ Usuário encontrado:', user.nome);


        const resetToken = generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        console.log('🔐 Token gerado (primeiros 10 chars):', resetToken.substring(0, 10) + '...');
        console.log('⏰ Expira em:', resetTokenExpiry.toISOString());


        const { data: updateData, error: updateError } = await supabase
            .from('table_usuario')
            .update({
                reset_token: resetToken,
                reset_token_expiry: resetTokenExpiry.toISOString()
            })
            .eq('id_usuario', user.id_usuario)
            .select();

        if (updateError) {
            console.error('❌ Erro ao salvar token:', updateError);
            

            console.log('🔄 Tentando atualizar por email...');
            const { error: emailUpdateError } = await supabase
                .from('table_usuario')
                .update({
                    reset_token: resetToken,
                    reset_token_expiry: resetTokenExpiry.toISOString()
                })
                .eq('email', email);

            if (emailUpdateError) {
                throw new Error('Erro ao salvar token: ' + emailUpdateError.message);
            }
            console.log('✅ Token salvo via email');
        } else {
            console.log('✅ Token salvo via ID. Resultado:', updateData);
        }


        const { data: verifyData, error: verifyError } = await supabase
            .from('table_usuario')
            .select('reset_token, reset_token_expiry')
            .eq('email', email)
            .single();

        if (verifyError) {
            console.error('❌ Erro na verificação:', verifyError);
        } else {
            console.log('🔍 Verificação pós-salvamento:');
            console.log('📊 Token no banco:', verifyData.reset_token ? verifyData.reset_token.substring(0, 20) + '...' : 'NULL');
            console.log('📊 Expiração no banco:', verifyData.reset_token_expiry);
        }


        console.log('📤 Enviando email para:', email);
        const emailSent = await sendPasswordResetEmail(email, resetToken, user.nome);

        if (!emailSent) {
            console.log('⚠️ Email não enviado, mas token gerado para testes');
            console.log('🔗 LINK DE TESTE:', `http://localhost:3000/bk-mobile/redefinir-senha?token=${resetToken}`);
        }

        console.log('✅ Processo de recuperação concluído');

        return {
            success: true,
            message: 'Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.'
        };

    } catch (error) {
        console.error('❌ Erro no service:', error);
        return {
            success: false,
            message: error.message || 'Erro ao processar solicitação'
        };
    }
};


export const resetPasswordService = async (token, newPassword) => {
    try {
        console.log('🔄 Iniciando redefinição com token:', token.substring(0, 10) + '...');


        const { data: user, error } = await supabase
            .from('table_usuario')
            .select('id_usuario, email, reset_token_expiry, senha_hash')
            .eq('reset_token', token)
            .single();

        if (error || !user) {
            console.error('❌ Token inválido. Erro:', error);
            

            const { data: allUsers } = await supabase
                .from('table_usuario')
                .select('email, reset_token')
                .not('reset_token', 'is', null);
            
            console.log('🔍 Tokens existentes no banco:');
            allUsers?.forEach(u => {
                console.log(`📧 ${u.email}: ${u.reset_token?.substring(0, 20)}...`);
            });
            
            throw new Error('Token inválido ou expirado');
        }


        const now = new Date();
        const expiryDate = new Date(user.reset_token_expiry);

        if (now > expiryDate) {
            console.error('❌ Token expirado');
            throw new Error('Token expirado');
        }

        console.log('✅ Token válido para:', user.email);


        const { error: updateError } = await supabase
            .from('table_usuario')
            .update({
                senha_hash: newPassword,
                reset_token: null,
                reset_token_expiry: null
            })
            .eq('reset_token', token);

        if (updateError) {
            console.error('❌ Erro ao atualizar senha:', updateError);
            throw new Error('Erro ao redefinir senha: ' + updateError.message);
        }

        console.log('✅ Senha redefinida com sucesso');

        return {
            success: true,
            message: 'Senha redefinida com sucesso!'
        };

    } catch (error) {
        console.error('❌ Erro no resetPasswordService:', error);
        return {
            success: false,
            message: error.message
        };
    }
};


export const validateResetTokenService = async (token) => {
    try {
        console.log('🔍 Validando token:', token.substring(0, 10) + '...');

        const { data: user, error } = await supabase
            .from('table_usuario')
            .select('email, nome, reset_token_expiry')
            .eq('reset_token', token)
            .single();

        if (error || !user) {
            console.error('❌ Token inválido na validação. Erro:', error);
            return { 
                valid: false, 
                message: 'Token inválido' 
            };
        }

        const now = new Date();
        const expiryDate = new Date(user.reset_token_expiry);

        if (now > expiryDate) {
            console.error('❌ Token expirado na validação');
            return { 
                valid: false, 
                message: 'Token expirado' 
            };
        }

        console.log('✅ Token válido para:', user.email);

        return { 
            valid: true, 
            message: 'Token válido',
            email: user.email,
            nome: user.nome
        };

    } catch (error) {
        console.error('❌ Erro na validação do token:', error);
        return { 
            valid: false, 
            message: 'Erro ao validar token' 
        };
    }
};


export const cleanupExpiredTokens = async () => {
    try {
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('table_usuario')
            .update({
                reset_token: null,
                reset_token_expiry: null
            })
            .lt('reset_token_expiry', now)
            .select();

        if (error) {
            console.error('Erro ao limpar tokens expirados:', error);
        } else {
            console.log('✅ Tokens expirados limpos. Afetados:', data.length);
        }

    } catch (error) {
        console.error('Erro no cleanup:', error);
    }
};