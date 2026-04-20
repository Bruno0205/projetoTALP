export type EvaluationCode = 'MANA' | 'MPA' | 'MA';

export interface Evaluation {
  classId: string;
  studentCpf: string;
  goal: string;
  code: EvaluationCode;
  updatedAt: string;
}
