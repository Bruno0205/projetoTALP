import { Student } from '../models/student';
import { readJson, writeJson } from '../utils/storage';
import path from 'path';

const DATA_FILE = path.resolve(__dirname, '../../data/students.json');

export default class StudentRepository {
  async getAll(): Promise<Student[]> {
    const data = await readJson<Student[]>(DATA_FILE, []);
    return data;
  }

  async findByCpf(cpf: string): Promise<Student | undefined> {
    const all = await this.getAll();
    return all.find(s => s.cpf === cpf);
  }

  async create(student: Student): Promise<Student> {
    const all = await this.getAll();
    all.push(student);
    await writeJson(DATA_FILE, all);
    return student;
  }

  async update(cpf: string, student: Student): Promise<Student> {
    const all = await this.getAll();
    const idx = all.findIndex(s => s.cpf === cpf);
    if (idx === -1) throw new Error('Student not found');
    all[idx] = student;
    await writeJson(DATA_FILE, all);
    return student;
  }

  async delete(cpf: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(s => s.cpf !== cpf);
    await writeJson(DATA_FILE, filtered);
  }
}
