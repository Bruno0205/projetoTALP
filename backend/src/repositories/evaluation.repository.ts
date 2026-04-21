import path from 'path';
import { Evaluation } from '../models/evaluation';
import { readJson, writeJson } from '../utils/storage';

const DATA_FILE = path.resolve(__dirname, '../../data/evaluations.json');

export default class EvaluationRepository {
  async getAll(): Promise<Evaluation[]> {
    return readJson<Evaluation[]>(DATA_FILE, []);
  }

  async listByClass(classId: string): Promise<Evaluation[]> {
    const all = await this.getAll();
    return all.filter(e => e.classId === classId);
  }

  async findOne(classId: string, studentCpf: string, goal: string): Promise<Evaluation | undefined> {
    const all = await this.getAll();
    return all.find(e => e.classId === classId && e.studentCpf === studentCpf && e.goal === goal);
  }

  async upsert(record: Evaluation): Promise<Evaluation> {
    const all = await this.getAll();
    const index = all.findIndex(
      e => e.classId === record.classId && e.studentCpf === record.studentCpf && e.goal === record.goal
    );

    if (index >= 0) {
      all[index] = record;
    } else {
      all.push(record);
    }

    await writeJson(DATA_FILE, all);
    return record;
  }

  async deleteByClass(classId: string): Promise<void> {
    const all = await this.getAll();
    await writeJson(DATA_FILE, all.filter(e => e.classId !== classId));
  }

  async deleteByStudent(studentCpf: string): Promise<void> {
    const all = await this.getAll();
    await writeJson(DATA_FILE, all.filter(e => e.studentCpf !== studentCpf));
  }

  async deleteByClassAndStudent(classId: string, studentCpf: string): Promise<void> {
    const all = await this.getAll();
    await writeJson(
      DATA_FILE,
      all.filter(e => !(e.classId === classId && e.studentCpf === studentCpf))
    );
  }
}
