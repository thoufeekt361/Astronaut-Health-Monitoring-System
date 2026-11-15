import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerValidator, loginValidator } from '../validators/authValidators';

const router = Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

export default router;
