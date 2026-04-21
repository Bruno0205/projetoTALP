import { Classroom, Evaluation, EvaluationCode, Student } from './types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listStudents: () => request<Student[]>('/students'),
  createStudent: (payload: Student) => request<Student>('/students', { method: 'POST', body: JSON.stringify(payload) }),
  deleteStudent: (cpf: string) => request<void>(`/students/${cpf}`, { method: 'DELETE' }),

  listClasses: () => request<Classroom[]>('/classes'),
  createClass: (payload: {
    topic: string;
    year: number;
    semester: number;
    studentCpfs?: string[];
    goals?: string[];
  }) => request<Classroom>('/classes', { method: 'POST', body: JSON.stringify(payload) }),
  getClass: (id: string) => request<Classroom>(`/classes/${id}`),
  updateClass: (id: string, payload: Partial<Classroom>) =>
    request<Classroom>(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  enrollStudentInClass: (id: string, cpf: string) =>
    request<Classroom>(`/classes/${id}/students`, { method: 'POST', body: JSON.stringify({ cpf }) }),
  removeStudentFromClass: (id: string, cpf: string) =>
    request<Classroom>(`/classes/${id}/students/${encodeURIComponent(cpf)}`, { method: 'DELETE' }),

  listEvaluations: (classId: string) => request<Evaluation[]>(`/evaluations?classId=${encodeURIComponent(classId)}`),
  upsertEvaluation: (payload: { classId: string; studentCpf: string; goal: string; code: EvaluationCode }) =>
    request<Evaluation>('/evaluations', { method: 'POST', body: JSON.stringify(payload) }),

  endOfDay: () =>
    request<{ message: string; sent: Array<{ studentCpf: string; studentEmail: string }> }>('/notifications/end-of-day', {
      method: 'POST',
      body: JSON.stringify({})
    })
};
