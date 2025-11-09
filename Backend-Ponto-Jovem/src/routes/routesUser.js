
import express from 'express';
import { getUsersById, createUser, loginUser,updateUser } from '../controllers/userController.js';

const router = express.Router();


router.get('/usuario/:id', getUsersById);
router.post('/usuario', createUser);
router.post('/login', loginUser);         
router.put('/user/:id', updateUser);

export default router;