import { Router, Request, Response } from 'express';
import EvaluationsController from '../controllers/evaluations.controller';

const router = Router();
const controller = new EvaluationsController();

router.get('/', (req: Request, res: Response) => controller.listByClass(req, res));
router.post('/', (req: Request, res: Response) => controller.upsert(req, res));
router.post('/flush-daily', (req: Request, res: Response) => controller.flushDaily(req, res));
router.get('/pending-emails', (req: Request, res: Response) => controller.pending(req, res));
router.get('/email-logs', (req: Request, res: Response) => controller.logs(req, res));

export default router;
