import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';
import { Student } from '../types';

export default function StudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<Student>({ cpf: '', fullName: '', email: '' });
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  async function load() {
    const data = await api.listStudents();
    setStudents(data);
  }

  useEffect(() => {
    load().catch(err => setError(err.message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setFormError('');

    if (!form.fullName.trim() || !form.cpf.trim() || !form.email.trim()) {
      setFormError('Full Name, CPF, and Email are required.');
      return;
    }

    try {
      await api.createStudent({
        cpf: form.cpf.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim()
      });
      setForm({ cpf: '', fullName: '', email: '' });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function onDelete(cpf: string) {
    setError('');
    try {
      await api.deleteStudent(cpf);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <section className="page-content">
      <h2 className="page-title">Student Management</h2>
      <div className="glass card">
        <form onSubmit={onSubmit}>
          <div className="form-row form-row-3">
            <input
              className="field"
              placeholder="Full Name"
              value={form.fullName}
              onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
            />
            <input
              className="field"
              placeholder="CPF"
              value={form.cpf}
              onChange={e => setForm(prev => ({ ...prev, cpf: e.target.value }))}
            />
            <input
              className="field"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            />
            <button className="btn btn-primary" type="submit">
              Add Student
            </button>
          </div>
        </form>
        {formError && <p className="error">{formError}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="glass card">
        <table className="data-table">
          <thead>
            <tr>
              <th>CPF</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.cpf}>
                <td>{student.cpf}</td>
                <td>{student.fullName}</td>
                <td>{student.email}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => onDelete(student.cpf)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
