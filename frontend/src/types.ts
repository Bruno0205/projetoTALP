export interface Student {
  cpf: string;
  fullName: string;
  email: string;
}

export interface Classroom {
  id: string;
  topic: string;
  year: number;
  semester: number;
  name: string;
  studentCpfs: string[];
  goals: string[];
}

export type EvaluationCode = 'MANA' | 'MPA' | 'MA';

export interface Evaluation {
  classId: string;
  studentCpf: string;
  goal: string;
  code: EvaluationCode;
  updatedAt: string;
}
