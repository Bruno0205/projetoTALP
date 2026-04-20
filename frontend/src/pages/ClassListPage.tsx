import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Classroom } from '../types';

export default function ClassListPage() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [error, setError] = useState('');
  const [topic, setTopic] = useState('Introduction to Programming');
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);

  async function load() {
    const data = await api.listClasses();
    setClasses(data);
  }

  useEffect(() => {
    load().catch(err => setError(err.message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.createClass({ topic, year, semester });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <section className="page-content">
      <h2 className="page-title">Class Management</h2>
      <div className="glass card">
        <form onSubmit={onSubmit}>
          <div className="form-row form-row-3">
            <input className="field" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic" />
            <input
              className="field"
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              placeholder="Year"
            />
            <select className="field" value={semester} onChange={e => setSemester(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
            <button className="btn btn-primary" type="submit">
              Create Class
            </button>
          </div>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="glass card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Students</th>
              <th>Goals</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.studentCpfs.length}</td>
                <td>{item.goals.join(', ')}</td>
                <td>
                  <Link className="btn btn-secondary" to={`/classes/${item.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
