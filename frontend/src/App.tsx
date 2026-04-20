import { Link, Route, Routes } from 'react-router-dom';
import StudentListPage from './pages/StudentListPage';
import ClassListPage from './pages/ClassListPage';
import ClassDetailPage from './pages/ClassDetailPage';

export default function App() {
  return (
    <div className="app-shell">
      <header className="glass topbar">
        <h1 className="brand-title">TALP Management</h1>
        <nav className="nav-links">
          <Link to="/students">Students</Link>
          <Link to="/classes">Classes</Link>
        </nav>
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
