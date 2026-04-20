import { Request, Response } from 'express';
import ClassService from '../services/class.service';

export default class ClassesController {
  private service = new ClassService();

  async list(req: Request, res: Response) {
    const classes = await this.service.getAll();
    return res.json(classes);
  }

  async create(req: Request, res: Response) {
    try {
      const created = await this.service.create(req.body);
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async get(req: Request, res: Response) {
    const item = await this.service.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Class not found' });
    return res.json(item);
  }

  async update(req: Request, res: Response) {
    try {
      const updated = await this.service.update(req.params.id, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async enroll(req: Request, res: Response) {
    try {
      const cpf = req.body.cpf ?? req.body.studentCpf;
      const updated = await this.service.enrollStudent(req.params.id, cpf);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async removeStudent(req: Request, res: Response) {
    try {
      const updated = await this.service.removeStudent(req.params.id, req.params.cpf);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
