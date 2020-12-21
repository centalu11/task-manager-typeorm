import { Router } from 'express';
import { UserController } from '../controller/UserController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/users', UserController.create);

router.get('/users', UserController.getAll);

router.get('/users/me', auth, UserController.getProfile);

router.get('/users/:id', UserController.getById);

router.patch('/users/me', auth, UserController.updateProfile);

router.patch('/users/:id', UserController.updateById);

router.delete('/users/me', auth, UserController.deleteProfile);

router.delete('/users/:id', UserController.deleteById);

router.post('/users/login', UserController.login);

router.post('/users/logout', auth, UserController.logout);

router.post('/users/logout/all', auth, UserController.logoutAll);

export default router;