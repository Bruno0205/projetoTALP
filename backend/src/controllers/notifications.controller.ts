import { Request, Response } from 'express';
import NotificationService from '../services/notification.service';

export default class NotificationsController {
  private service = new NotificationService();

  async endOfDay(req: Request, res: Response) {
    try {
      const date = req.body?.date as string | undefined;
      const sent = await this.service.endOfDay(date);
      return res.json({
        message: sent.length ? `Emails sent: ${sent.length}` : 'No changes to notify',
        sent
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
