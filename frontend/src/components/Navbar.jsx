import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, User } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <Activity size={28} color="var(--accent)" />
        GymTracker
      </Link>
      
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/progress" className="nav-link">Progress</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link">Admin Panel</Link>
            )}
            <Link 
              to="/profile" 
              className="flex items-center justify-center" 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--accent)', 
                color: '#000', 
                fontWeight: 'bold', 
                fontSize: '1.2rem',
                textDecoration: 'none',
                marginLeft: '1rem'
              }}
              title="Your Profile"
            >
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </Link>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', marginLeft: '1rem' }}>
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
