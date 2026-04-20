import { Request, Response } from 'express';
import EvaluationService from '../services/evaluation.service';

export default class EvaluationsController {
  private service = new EvaluationService();

  async listByClass(req: Request, res: Response) {
    const { classId } = req.query;
    if (!classId || typeof classId !== 'string') {
      return res.status(400).json({ error: 'classId query parameter is required' });
    }

    const result = await this.service.listByClass(classId);
    return res.json(result);
  }

  async upsert(req: Request, res: Response) {
    try {
      const saved = await this.service.upsert(req.body);
      return res.status(201).json(saved);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async flushDaily(req: Request, res: Response) {
    try {
      const date = req.body.date as string;
      if (!date) return res.status(400).json({ error: 'date is required' });
      const sent = await this.service.flushDaily(date);
      return res.json(sent);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async pending(req: Request, res: Response) {
    const pending = await this.service.listPendingEmails();
    return res.json(pending);
  }

  async logs(req: Request, res: Response) {
    const logs = await this.service.listEmailLogs();
    return res.json(logs);
  }
}
