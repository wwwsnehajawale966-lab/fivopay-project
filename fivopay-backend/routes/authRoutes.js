import express from 'express';
import { signup, login, resetPassword, updateProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.put('/profile', updateProfile);

export default router;
