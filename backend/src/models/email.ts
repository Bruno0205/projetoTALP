import { EvaluationCode } from './evaluation';

export interface PendingEmailChange {
  studentCpf: string;
  studentEmail: string;
  studentName: string;
  className: string;
  goal: string;
  oldCode: EvaluationCode;
  newCode: EvaluationCode;
  changedAt: string;
}

export interface SentEmailLog {
  studentCpf: string;
  studentEmail: string;
  date: string;
  changes: PendingEmailChange[];
  sentAt: string;
}
