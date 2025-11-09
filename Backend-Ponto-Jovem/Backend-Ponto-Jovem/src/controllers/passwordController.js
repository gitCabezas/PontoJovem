
import { 
    requestPasswordResetService, 
    resetPasswordService,
    validateResetTokenService 
} from '../services/passwordService.js';


export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email é obrigatório'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }

        console.log('👤 Solicitação de recuperação recebida para:', email);

        const result = await requestPasswordResetService(email);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('❌ Erro no controller requestPasswordReset:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token e nova senha são obrigatórios'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'A senha deve ter pelo menos 6 caracteres'
            });
        }

        console.log('🔄 Solicitação de redefinição recebida');

        const result = await resetPasswordService(token, newPassword);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('❌ Erro no controller resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    }
};


export const validateToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token é obrigatório'
            });
        }

        console.log('🔍 Validação de token solicitada');

        const result = await validateResetTokenService(token);

        if (result.valid) {
            res.status(200).json({
                success: true,
                valid: true,
                message: result.message,
                email: result.email
            });
        } else {
            res.status(400).json({
                success: false,
                valid: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('❌ Erro no controller validateToken:', error);
        res.status(500).json({
            success: false,
            valid: false,
            message: 'Erro ao validar token'
        });
    }
};


export const showResetPasswordPage = async (req, res) => {
    try {
        let { token } = req.query;

        console.log('🔗 Página de redefinição acessada');
        console.log('🔗 Token recebido (raw):', token);
        console.log('🔗 Token length:', token?.length);

        if (!token) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial; padding: 20px;">
                        <h2>❌ Token não encontrado</h2>
                        <p>O link está incompleto.</p>
                        <p><a href="/recuperar-senha">Solicitar novo link</a></p>
                    </body>
                </html>
            `);
        }


        try {
            token = decodeURIComponent(token);
            console.log('🔧 Token decodificado:', token.substring(0, 20) + '...');
        } catch (e) {
            console.log('⚠️ Token não precisa de decodificação');
        }


        if (token.startsWith('click:')) {
            token = token.replace('click:', '');
            console.log('🔧 Token limpo (removeu click:):', token.substring(0, 20) + '...');
        }

        console.log('🔍 Token final para validação:', token.substring(0, 20) + '...');
        console.log('🔍 Tamanho final:', token.length);


        const result = await validateResetTokenService(token);

        if (!result.valid) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial; padding: 20px;">
                        <h2>❌ Link inválido ou expirado</h2>
                        <p>${result.message}</p>
                        <p><a href="/recuperar-senha">Solicitar nova recuperação</a></p>
                    </body>
                </html>
            `);
        }

        console.log('✅ Token válido para:', result.email);


        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Redefinir Senha - Ponto Mobile</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { 
                        font-family: Arial, sans-serif; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                    }
                    .container { 
                        background: white; 
                        padding: 40px; 
                        border-radius: 15px; 
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                        width: 100%;
                        max-width: 450px;
                    }
                    h2 { 
                        color: #2563eb; 
                        text-align: center; 
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        text-align: center;
                        color: #666;
                        margin-bottom: 30px;
                    }
                    .user-info {
                        background: #f0f9ff;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        text-align: center;
                        border-left: 4px solid #2563eb;
                    }
                    .input-group { 
                        margin-bottom: 20px; 
                    }
                    label { 
                        display: block; 
                        margin-bottom: 8px; 
                        font-weight: bold;
                        color: #333;
                    }
                    input { 
                        width: 100%; 
                        padding: 12px; 
                        border: 2px solid #ddd; 
                        border-radius: 8px; 
                        font-size: 16px;
                        transition: border-color 0.3s;
                    }
                    input:focus {
                        outline: none;
                        border-color: #2563eb;
                    }
                    button { 
                        width: 100%; 
                        background: #2563eb; 
                        color: white; 
                        padding: 14px; 
                        border: none; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        font-size: 16px;
                        font-weight: bold;
                        transition: background 0.3s;
                        margin-top: 10px;
                    }
                    button:hover { background: #1d4ed8; }
                    button:disabled { background: #ccc; cursor: not-allowed; }
                    .message { 
                        padding: 12px; 
                        border-radius: 8px; 
                        margin-bottom: 20px; 
                        display: none; 
                        text-align: center;
                    }
                    .success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
                    .error { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    .debug-info {
                        background: #f5f5f5; 
                        padding: 10px; 
                        border-radius: 5px; 
                        margin: 10px 0; 
                        font-size: 12px; 
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🔐 Redefinir Senha</h2>
                    <p class="subtitle">Digite sua nova senha abaixo</p>
                    
                    <div class="user-info">
                        <strong>Conta:</strong> ${result.email}<br>
                        <strong>Usuário:</strong> ${result.nome}
                    </div>
                    
                    <div class="debug-info">
                        <strong>Debug:</strong> Token: ${token.substring(0, 20)}... (${token.length} chars)
                    </div>
                    
                    <div id="message" class="message"></div>
                    
                    <form id="resetForm">
                        <input type="hidden" id="token" value="${token}">
                        
                        <div class="input-group">
                            <label for="newPassword">Nova Senha (mínimo 6 caracteres):</label>
                            <input type="password" id="newPassword" required minlength="6" placeholder="Digite sua nova senha">
                        </div>
                        
                        <div class="input-group">
                            <label for="confirmPassword">Confirmar Senha:</label>
                            <input type="password" id="confirmPassword" required placeholder="Digite a senha novamente">
                        </div>
                        
                        <button type="submit" id="submitBtn">🔄 Redefinir Senha</button>
                    </form>
                    
                    <div class="footer">
                        <p>⚠️ Esta página expira em 1 hora</p>
                    </div>
                </div>

                <script>
                    const form = document.getElementById('resetForm');
                    const submitBtn = document.getElementById('submitBtn');
                    const messageDiv = document.getElementById('message');
                    
                    form.addEventListener('submit', async function(e) {
                        e.preventDefault();
                        
                        const token = document.getElementById('token').value;
                        const newPassword = document.getElementById('newPassword').value;
                        const confirmPassword = document.getElementById('confirmPassword').value;
                        

                        if (newPassword.length < 6) {
                            showMessage('A senha deve ter pelo menos 6 caracteres', 'error');
                            return;
                        }
                        
                        if (newPassword !== confirmPassword) {
                            showMessage('As senhas não coincidem', 'error');
                            return;
                        }
                        

                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Processando...';
                        
                        try {
                            const response = await fetch('/bk-mobile/redefinir-senha', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    token: token,
                                    newPassword: newPassword
                                })
                            });
                            
                            const result = await response.json();
                            
                            if (result.success) {
                                showMessage('✅ Senha redefinida com sucesso! Redirecionando para login...', 'success');
                                setTimeout(() => {
                                    window.location.href = '/login';
                                }, 2000);
                            } else {
                                showMessage('❌ ' + result.message, 'error');
                                submitBtn.disabled = false;
                                submitBtn.textContent = '🔄 Redefinir Senha';
                            }
                            
                        } catch (error) {
                            showMessage('❌ Erro de conexão. Tente novamente.', 'error');
                            submitBtn.disabled = false;
                            submitBtn.textContent = '🔄 Redefinir Senha';
                        }
                    });
                    
                    function showMessage(text, type) {
                        messageDiv.textContent = text;
                        messageDiv.className = 'message ' + type;
                        messageDiv.style.display = 'block';
                        messageDiv.scrollIntoView({ behavior: 'smooth' });
                    }
                </script>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('❌ Erro na página de redefinição:', error);
        res.status(500).send(`
            <html>
                <body style="font-family: Arial; padding: 20px;">
                    <h2>❌ Erro interno</h2>
                    <p>${error.message}</p>
                    <p><a href="/recuperar-senha">Tentar novamente</a></p>
                </body>
            </html>
        `);
    }
};


export const debugToken = async (req, res) => {
    try {
        const { token } = req.query;
        
        console.log('🐛 DEBUG TOKEN:');
        console.log('🔗 URL:', req.originalUrl);
        console.log('🔗 Token raw:', token);
        console.log('🔗 Token length:', token?.length);

        res.json({
            token_recebido: token,
            token_length: token?.length,
            url_completa: req.originalUrl
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};