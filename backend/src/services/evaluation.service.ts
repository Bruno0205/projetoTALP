import ClassRepository from '../repositories/class.repository';
import EvaluationRepository from '../repositories/evaluation.repository';
import StudentRepository from '../repositories/student.repository';
import { Evaluation, EvaluationCode } from '../models/evaluation';
import EmailService from './email.service';

const ALLOWED_CODES: EvaluationCode[] = ['MANA', 'MPA', 'MA'];

export default class EvaluationService {
  private classRepo = new ClassRepository();
  private studentRepo = new StudentRepository();
  private evaluationRepo = new EvaluationRepository();
  private emailService = new EmailService();

  async listByClass(classId: string): Promise<Evaluation[]> {
    return this.evaluationRepo.listByClass(classId);
  }

  async upsert(input: {
    classId: string;
    studentCpf: string;
    goal: string;
    code: EvaluationCode;
    changedAt?: string;
  }): Promise<Evaluation> {
    if (!ALLOWED_CODES.includes(input.code)) {
      throw new Error('Invalid evaluation code; accepted: MANA, MPA, MA');
    }

    const classroom = await this.classRepo.findById(input.classId);
    if (!classroom) throw new Error(`Class ${input.classId} does not exist`);

    if (!classroom.goals.includes(input.goal)) {
      throw new Error(`Goal ${input.goal} does not exist for ${classroom.name}`);
    }

    if (!classroom.studentCpfs.includes(input.studentCpf)) {
      throw new Error(`Student with CPF ${input.studentCpf} is not enrolled in ${classroom.name}`);
    }

    const student = await this.studentRepo.findByCpf(input.studentCpf);
    if (!student) throw new Error(`Student with CPF ${input.studentCpf} does not exist`);

    const existing = await this.evaluationRepo.findOne(input.classId, input.studentCpf, input.goal);
    const changedAt = input.changedAt ?? new Date().toISOString();

    const record: Evaluation = {
      classId: input.classId,
      studentCpf: input.studentCpf,
      goal: input.goal,
      code: input.code,
      updatedAt: changedAt
    };

    const saved = await this.evaluationRepo.upsert(record);

    if (!existing || existing.code !== input.code) {
      await this.emailService.queueChange({
        studentCpf: input.studentCpf,
        studentEmail: student.email,
        studentName: student.fullName,
        className: classroom.name,
        goal: input.goal,
        oldCode: existing?.code ?? 'MANA',
        newCode: input.code,
        changedAt
      });
    }

    return saved;
  }

  async flushDaily(date: string) {
    return this.emailService.flushDaily(date);
  }

  async listPendingEmails() {
    return this.emailService.listPending();
  }

  async listEmailLogs() {
    return this.emailService.listLogs();
  }
}
