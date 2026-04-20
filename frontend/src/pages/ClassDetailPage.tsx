import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { Classroom, Evaluation, EvaluationCode, Student } from '../types';

function evaluationClass(code?: string): string {
  if (code === 'MANA') return 'eval-badge eval-mana';
  if (code === 'MPA') return 'eval-badge eval-mpa';
  if (code === 'MA') return 'eval-badge eval-ma';
  return 'eval-badge eval-empty';
}

export default function ClassDetailPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedCpf, setSelectedCpf] = useState('');
  const [enrollCpf, setEnrollCpf] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('Requirements');
  const [selectedCode, setSelectedCode] = useState<EvaluationCode>('MANA');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function load() {
    if (!id) return;
    const [classData, allStudents, evals] = await Promise.all([
      api.getClass(id),
      api.listStudents(),
      api.listEvaluations(id)
    ]);

    setClassroom(classData);
    setAllStudents(allStudents);
    const enrolled = allStudents.filter(s => classData.studentCpfs.includes(s.cpf));
    setStudents(enrolled);
    setEvaluations(evals);
    setSelectedCpf(prev => {
      if (prev && classData.studentCpfs.includes(prev)) {
        return prev;
      }
      return classData.studentCpfs[0] || '';
    });
    const nextAvailableCpf = allStudents.find(s => !classData.studentCpfs.includes(s.cpf))?.cpf || '';
    setEnrollCpf(prev => {
      if (prev && allStudents.some(s => s.cpf === prev) && !classData.studentCpfs.includes(prev)) {
        return prev;
      }
      return nextAvailableCpf;
    });
    setSelectedGoal(prev => {
      if (prev && classData.goals.includes(prev)) {
        return prev;
      }
      return classData.goals[0] || 'Requirements';
    });
  }

  useEffect(() => {
    load().catch(err => setError(err.message));
  }, [id]);

  const table = useMemo(() => {
    const byCpfGoal = new Map<string, string>();
    for (const item of evaluations) {
      byCpfGoal.set(`${item.studentCpf}|${item.goal}`, item.code);
    }
    return byCpfGoal;
  }, [evaluations]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError('');
    setSuccessMessage('');

    if (!selectedCpf) {
      setError('Select an enrolled student before saving evaluations.');
      return;
    }

    try {
      await api.upsertEvaluation({
        classId: id,
        studentCpf: selectedCpf,
        goal: selectedGoal,
        code: selectedCode
      });
      await load();
      setSuccessMessage('Evaluation saved.');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function onEnrollStudent(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError('');
    setSuccessMessage('');

    if (!enrollCpf) {
      setError('No available student to enroll.');
      return;
    }

    try {
      await api.enrollStudentInClass(id, enrollCpf);
      await load();
      setSuccessMessage(`Student ${enrollCpf} enrolled successfully.`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!classroom) return <p>Loading...</p>;

  const availableStudents = allStudents.filter(student => !classroom.studentCpfs.includes(student.cpf));

  return (
    <section className="page-content">
      <h2 className="page-title">{classroom.name}</h2>

      <div className="glass card">
        <h3>Enroll Student by CPF</h3>
        <form onSubmit={onEnrollStudent}>
          <div className="form-row form-row-3">
            <select className="field" value={enrollCpf} onChange={e => setEnrollCpf(e.target.value)}>
              <option value="">Select CPF</option>
              {availableStudents.map(student => (
                <option key={student.cpf} value={student.cpf}>
                  {student.cpf} - {student.fullName}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" type="submit" disabled={!enrollCpf}>
              Enroll Student
            </button>
          </div>
        </form>
      </div>

      <div className="glass card">
        <h3>Update Evaluation</h3>
        <form onSubmit={onSubmit}>
          <div className="form-row form-row-4">
            <select className="field" value={selectedCpf} onChange={e => setSelectedCpf(e.target.value)}>
              <option value="">Select enrolled student</option>
              {classroom.studentCpfs.map(cpf => (
                <option key={cpf} value={cpf}>
                  {cpf}
                </option>
              ))}
            </select>
            <select className="field" value={selectedGoal} onChange={e => setSelectedGoal(e.target.value)}>
              {classroom.goals.map(goal => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
            <select className="field" value={selectedCode} onChange={e => setSelectedCode(e.target.value as EvaluationCode)}>
              <option value="MANA">MANA</option>
              <option value="MPA">MPA</option>
              <option value="MA">MA</option>
            </select>
            <button className="btn btn-primary" type="submit">
              Save
            </button>
          </div>
        </form>
        {successMessage && <p className="success">{successMessage}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="glass card">
        <h3>Evaluation Table</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>CPF</th>
              <th>Name</th>
              {classroom.goals.map(goal => (
                <th key={goal}>{goal}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.cpf}>
                <td>{student.cpf}</td>
                <td>{student.fullName}</td>
                {classroom.goals.map(goal => (
                  <td key={goal}>
                    <span className={evaluationClass(table.get(`${student.cpf}|${goal}`))}>
                      {table.get(`${student.cpf}|${goal}`) || '-'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
