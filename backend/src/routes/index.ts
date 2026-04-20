import { Router } from 'express';
import studentsRouter from './students.routes';
import classesRouter from './classes.routes';
import evaluationsRouter from './evaluations.routes';

const router = Router();
router.use('/students', studentsRouter);
router.use('/classes', classesRouter);
router.use('/evaluations', evaluationsRouter);

export default router;
