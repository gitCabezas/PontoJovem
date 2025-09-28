// routes/passwordRoutes.js - CORRIGIDO
import express from 'express';
import { 
    requestPasswordReset, 
    resetPassword,
    validateToken,
    showResetPasswordPage,
    debugToken
} from '../controllers/passwordController.js';

const router = express.Router();


router.get('/redefinir-senha', showResetPasswordPage); // ← DEVE VIR PRIMEIRO

// Depois as outras rotas
router.post('/recuperar-senha', requestPasswordReset);
router.post('/redefinir-senha', resetPassword);
router.get('/validar-token/:token', validateToken);
router.get('/debug-token', debugToken);

export default router;