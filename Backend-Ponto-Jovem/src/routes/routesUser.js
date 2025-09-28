// routes/routesUser.js - CORRIGIDO
import express from 'express';
import { getUsersById, createUser, loginUser } from '../controllers/userController.js';

const router = express.Router();


router.get('/usuario/:id', getUsersById); // ← DE /:id PARA /usuario/:id
router.post('/usuario', createUser);      // ← DE / PARA /usuario  
router.post('/login', loginUser);         

export default router;