import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Components & Pages
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkoutTracking from './pages/WorkoutTracking';
import CustomWorkout from './pages/CustomWorkout';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="container flex justify-center mt-8">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/workout" element={
          <ProtectedRoute>
            <WorkoutTracking />
          </ProtectedRoute>
        } />

        <Route path="/custom-workout" element={
          <ProtectedRoute>
            <CustomWorkout />
          </ProtectedRoute>
        } />
        
        <Route path="/progress" element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
