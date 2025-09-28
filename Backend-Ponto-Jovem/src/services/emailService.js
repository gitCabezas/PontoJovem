// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
    console.log('🔧 Configurando email com:', process.env.EMAIL_USER);
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        secure: false,
        requireTLS: true,
        tls: {
            rejectUnauthorized: false
        }
    });
};

export const sendPasswordResetEmail = async (email, resetToken, userName = '') => {
    let transporter;
    
    try {
        console.log('📤 Tentando enviar email para:', email);
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ Variáveis de email não configuradas');
            throw new Error('Configuração de email incompleta');
        }
        
        transporter = createTransporter();
        
        const encodedToken = encodeURIComponent(resetToken);
        const resetLink = `http://localhost:3000/bk-mobile/redefinir-senha?token=${encodedToken}`;
        
        console.log('🔗 Link com token codificado:', resetLink);

        const mailOptions = {
            from: `"Ponto Mobile" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Recuperação de Senha - Ponto Mobile',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>🔐 Ponto Mobile</h1>
                        <p>Recuperação de Senha</p>
                    </div>
                    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2>Olá ${userName}!</h2>
                        <p>Recebemos uma solicitação para redefinir sua senha.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
                                🔓 Redefinir Minha Senha
                            </a>
                        </div>
                        
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace;">
                            ${resetLink}
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p><strong>⚠️ Importante:</strong></p>
                            <ul>
                                <li>Este link expira em <strong>1 hora</strong></li>
                                <li>Não compartilhe este email com ninguém</li>
                                <li>Se você não solicitou esta alteração, ignore este email</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado com sucesso! Message ID:', info.messageId);
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error.message);
        

        const encodedToken = encodeURIComponent(resetToken);
        const testLink = `http://localhost:3000/bk-mobile/redefinir-senha?token=${encodedToken}`;
        
        console.log('🔗 LINK PARA TESTE (codificado):', testLink);
        console.log('🔗 LINK PARA TESTE (original):', `http://localhost:3000/bk-mobile/redefinir-senha?token=${resetToken}`);
        
        return false;
    }
};