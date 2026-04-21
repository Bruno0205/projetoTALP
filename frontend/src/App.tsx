import { Link, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import StudentListPage from './pages/StudentListPage';
import ClassListPage from './pages/ClassListPage';
import ClassDetailPage from './pages/ClassDetailPage';
import { api } from './api';

export default function App() {
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleEndOfDay = async () => {
    setSending(true);
    setFeedback('');
    try {
      const result = await api.endOfDay();
      setFeedback(result.message);
    } catch (error: any) {
      setFeedback(error.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="glass topbar">
        <div>
          <h1 className="brand-title">TALP Management</h1>
          {feedback ? <p className="header-feedback">{feedback}</p> : null}
        </div>
        <div className="topbar-actions">
          <nav className="nav-links">
            <Link to="/students">Students</Link>
            <Link to="/classes">Classes</Link>
          </nav>
          <button className="btn btn-primary" onClick={handleEndOfDay} disabled={sending}>
            {sending ? 'Sending...' : 'End of Day'}
          </button>
        </div>
      </header>
      <main className="page-container">
        <Routes>
          <Route path="/" element={<ClassListPage />} />
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/classes" element={<ClassListPage />} />
          <Route path="/classes/:id" element={<ClassDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
