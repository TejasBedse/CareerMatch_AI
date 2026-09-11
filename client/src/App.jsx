import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/api';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JdAnalyzer from './pages/JdAnalyzer';
import MatchResults from './pages/MatchResults';
import SkillRoadmap from './pages/SkillRoadmap';
import InterviewPrep from './pages/InterviewPrep';
import Applications from './pages/Applications';
import ProjectDetails from './pages/ProjectDetails';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/project-details" element={<ProjectDetails />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
        <Route path="/jd" element={<ProtectedRoute><JdAnalyzer /></ProtectedRoute>} />
        <Route path="/match" element={<ProtectedRoute><MatchResults /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><SkillRoadmap /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
