import ClassRepository from '../repositories/class.repository';
import EvaluationRepository from '../repositories/evaluation.repository';
import StudentRepository from '../repositories/student.repository';
import { Classroom } from '../models/classroom';
import { createId } from '../utils/id';

const DEFAULT_GOALS = ['Requirements', 'Tests'];

function buildClassName(topic: string, year: number, semester: number): string {
  return `${topic} - ${year} S${semester}`;
}

export default class ClassService {
  private classRepo = new ClassRepository();
  private studentRepo = new StudentRepository();
  private evaluationRepo = new EvaluationRepository();

  async getAll(): Promise<Classroom[]> {
    return this.classRepo.getAll();
  }

  async getById(id: string): Promise<Classroom | undefined> {
    return this.classRepo.findById(id);
  }

  async create(input: {
    topic: string;
    year: number;
    semester: number;
    studentCpfs?: string[];
    goals?: string[];
  }): Promise<Classroom> {
    if (!input.topic || !input.topic.trim()) throw new Error('Topic is required');
    if (!Number.isInteger(input.year) || input.year < 1900 || input.year > 3000) {
      throw new Error('Year must be within valid range');
    }
    if (!Number.isInteger(input.semester) || input.semester < 1 || input.semester > 2) {
      throw new Error('Semester must be numeric/valid');
    }

    const name = buildClassName(input.topic.trim(), input.year, input.semester);
    const exists = await this.classRepo.findByName(name);
    if (exists) throw new Error('Class already exists');

    const studentCpfs = input.studentCpfs ?? [];
    for (const cpf of studentCpfs) {
      const student = await this.studentRepo.findByCpf(cpf);
      if (!student) throw new Error(`Student with CPF ${cpf} does not exist`);
    }

    const classroom: Classroom = {
      id: createId('class'),
      topic: input.topic.trim(),
      year: input.year,
      semester: input.semester,
      name,
      studentCpfs,
      goals: (input.goals && input.goals.length > 0 ? input.goals : DEFAULT_GOALS).map(g => g.trim())
    };

    return this.classRepo.create(classroom);
  }

  async update(id: string, payload: Partial<Classroom>): Promise<Classroom> {
    const current = await this.classRepo.findById(id);
    if (!current) throw new Error('Class not found');

    const topic = payload.topic ?? current.topic;
    const year = payload.year ?? current.year;
    const semester = payload.semester ?? current.semester;

    if (!topic || !topic.trim()) throw new Error('Topic is required');
    if (!Number.isInteger(year) || year < 1900 || year > 3000) throw new Error('Year must be within valid range');
    if (!Number.isInteger(semester) || semester < 1 || semester > 2) {
      throw new Error('Semester must be numeric/valid');
    }

    const next: Classroom = {
      ...current,
      ...payload,
      topic: topic.trim(),
      year,
      semester,
      name: buildClassName(topic.trim(), year, semester)
    };

    return this.classRepo.update(id, next);
  }

  async delete(id: string): Promise<void> {
    const current = await this.classRepo.findById(id);
    if (!current) throw new Error('Class not found');
    await this.classRepo.delete(id);
    await this.evaluationRepo.deleteByClass(id);
  }

  async enrollStudent(id: string, cpf: string): Promise<Classroom> {
    if (!cpf || !cpf.trim()) {
      throw new Error('CPF is required');
    }

    const current = await this.classRepo.findById(id);
    if (!current) throw new Error('Class not found');
    const normalizedCpf = cpf.trim();
    const student = await this.studentRepo.findByCpf(normalizedCpf);
    if (!student) throw new Error(`Student with CPF ${normalizedCpf} does not exist`);

    if (current.studentCpfs.includes(normalizedCpf)) {
      throw new Error(`Student with CPF ${normalizedCpf} is already enrolled in ${current.name}`);
    }

    current.studentCpfs.push(normalizedCpf);

    return this.classRepo.update(id, current);
  }

  async removeStudent(id: string, cpf: string): Promise<Classroom> {
    const current = await this.classRepo.findById(id);
    if (!current) throw new Error('Class not found');
    current.studentCpfs = current.studentCpfs.filter(item => item !== cpf);
    return this.classRepo.update(id, current);
  }
}
