import { Router, Request, Response } from 'express';
import NotificationsController from '../controllers/notifications.controller';

const router = Router();
const controller = new NotificationsController();

router.post('/end-of-day', (req: Request, res: Response) => controller.endOfDay(req, res));

export default router;
