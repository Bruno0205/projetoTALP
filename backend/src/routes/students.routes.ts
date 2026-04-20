import { Router, Request, Response } from 'express';
import StudentsController from '../controllers/students.controller';

const router = Router();
const controller = new StudentsController();

router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.get('/:cpf', (req: Request, res: Response) => controller.get(req, res));
router.put('/:cpf', (req: Request, res: Response) => controller.update(req, res));
router.delete('/:cpf', (req: Request, res: Response) => controller.delete(req, res));

export default router;
