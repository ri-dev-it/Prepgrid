import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import ProblemDetail from './pages/ProblemDetail';
import Interview from './pages/Interview';
import InterviewSession from './pages/InterviewSession';
import InterviewHistory from './pages/InterviewHistory';
import Quiz from './pages/Quiz';
import QuizSession from './pages/QuizSession';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuthStore();
  return !user ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Protected */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/:id" element={<ProblemDetail />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/interview/session" element={<InterviewSession />} />
          <Route path="/interview/history" element={<InterviewHistory />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/session" element={<QuizSession />} />
          <Route path="/leaderboard/:topic?" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/billing" element={<Billing />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute><AdminRoute><Admin /></AdminRoute></PrivateRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
