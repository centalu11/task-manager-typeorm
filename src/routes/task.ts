import { Router } from 'express';
import { TaskController } from '../controller/TaskController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/tasks', auth, TaskController.create);

router.get('/tasks', auth, TaskController.getAll);

router.get('/tasks/:id', auth, TaskController.getById);

router.patch('/tasks/:id', auth, TaskController.updateById);

router.delete('/tasks/:id', auth, TaskController.deleteById);

export default router;