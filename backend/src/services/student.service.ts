import StudentRepository from '../repositories/student.repository';
import { Student } from '../models/student';
import ClassRepository from '../repositories/class.repository';
import EvaluationRepository from '../repositories/evaluation.repository';

export default class StudentService {
  private repo = new StudentRepository();
  private classRepo = new ClassRepository();
  private evaluationRepo = new EvaluationRepository();

  async getAll(): Promise<Student[]> {
    return this.repo.getAll();
  }

  async create(payload: Partial<Student>): Promise<Student> {
    if (!payload.cpf) throw new Error('CPF is required');
    if (!payload.fullName) throw new Error('Full Name is required');
    if (!payload.email) throw new Error('Email is required');
    const exists = await this.repo.findByCpf(payload.cpf as string);
    if (exists) throw new Error('CPF already exists');
    const student: Student = {
      cpf: payload.cpf as string,
      fullName: payload.fullName as string,
      email: payload.email as string
    };
    return this.repo.create(student);
  }

  async findByCpf(cpf: string) {
    return this.repo.findByCpf(cpf);
  }

  async update(cpf: string, payload: Partial<Student>) {
    const student = await this.repo.findByCpf(cpf);
    if (!student) throw new Error('Student not found');
    const updated = { ...student, ...payload } as Student;
    return this.repo.update(cpf, updated);
  }

  async delete(cpf: string) {
    const student = await this.repo.findByCpf(cpf);
    if (!student) throw new Error('Student not found');
    await this.repo.delete(cpf);

    const classes = await this.classRepo.getAll();
    for (const classroom of classes) {
      if (classroom.studentCpfs.includes(cpf)) {
        classroom.studentCpfs = classroom.studentCpfs.filter(item => item !== cpf);
        await this.classRepo.update(classroom.id, classroom);
      }
    }

    await this.evaluationRepo.deleteByStudent(cpf);
  }
}
