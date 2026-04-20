import { Router, Request, Response } from 'express';
import ClassesController from '../controllers/classes.controller';

const router = Router();
const controller = new ClassesController();

router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.get('/:id', (req: Request, res: Response) => controller.get(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.delete('/:id', (req: Request, res: Response) => controller.delete(req, res));
router.post('/:id/students', (req: Request, res: Response) => controller.enroll(req, res));
router.post('/:id/enroll', (req: Request, res: Response) => controller.enroll(req, res));
router.delete('/:id/students/:cpf', (req: Request, res: Response) => controller.removeStudent(req, res));

export default router;
