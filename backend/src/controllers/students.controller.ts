import { Request, Response } from 'express';
import StudentService from '../services/student.service';

export default class StudentsController {
  private service = new StudentService();

  async list(req: Request, res: Response) {
    const students = await this.service.getAll();
    return res.json(students);
  }

  async create(req: Request, res: Response) {
    try {
      const payload = req.body;
      const student = await this.service.create(payload);
      return res.status(201).json(student);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async get(req: Request, res: Response) {
    const { cpf } = req.params;
    const student = await this.service.findByCpf(cpf);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    return res.json(student);
  }

  async update(req: Request, res: Response) {
    const { cpf } = req.params;
    try {
      const updated = await this.service.update(cpf, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    const { cpf } = req.params;
    try {
      await this.service.delete(cpf);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
