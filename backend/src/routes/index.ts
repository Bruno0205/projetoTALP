import { Router } from 'express';
import studentsRouter from './students.routes';
import classesRouter from './classes.routes';
import evaluationsRouter from './evaluations.routes';
import notificationsRouter from './notifications.routes';

const router = Router();
router.use('/students', studentsRouter);
router.use('/classes', classesRouter);
router.use('/evaluations', evaluationsRouter);
router.use('/notifications', notificationsRouter);

export default router;
