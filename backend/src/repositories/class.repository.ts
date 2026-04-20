import path from 'path';
import { Classroom } from '../models/classroom';
import { readJson, writeJson } from '../utils/storage';

const DATA_FILE = path.resolve(__dirname, '../../data/classes.json');

export default class ClassRepository {
  async getAll(): Promise<Classroom[]> {
    return readJson<Classroom[]>(DATA_FILE, []);
  }

  async findById(id: string): Promise<Classroom | undefined> {
    const all = await this.getAll();
    return all.find(c => c.id === id);
  }

  async findByName(name: string): Promise<Classroom | undefined> {
    const all = await this.getAll();
    return all.find(c => c.name === name);
  }

  async create(classroom: Classroom): Promise<Classroom> {
    const all = await this.getAll();
    all.push(classroom);
    await writeJson(DATA_FILE, all);
    return classroom;
  }

  async update(id: string, classroom: Classroom): Promise<Classroom> {
    const all = await this.getAll();
    const index = all.findIndex(c => c.id === id);
    if (index < 0) throw new Error('Class not found');
    all[index] = classroom;
    await writeJson(DATA_FILE, all);
    return classroom;
  }

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    await writeJson(DATA_FILE, all.filter(c => c.id !== id));
  }
}
