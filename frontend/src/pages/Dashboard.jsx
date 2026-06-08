import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Calendar, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', age: '', height: '', weight: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/workout/routines', config);
        setRoutines(data.sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek)));
      } catch (error) {
        console.error('Error fetching routines:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/auth/profile`, config);
        setProfile({
          name: data.name || '',
          age: data.age || '',
          height: data.height || '',
          weight: data.weight || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    if (user) {
      fetchRoutines();
      fetchProfile();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/auth/profile`, profile, config);
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (error) {
      setProfileMessage('Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) return <div className="container flex justify-center mt-8">Loading...</div>;

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ margin: 0 }}>Your Split Routine</h1>
          <p>Select a day to track your workout</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/custom-workout')}
        >
          Start Custom Workout
        </button>
      </div>

      {/* User Profile Section */}
      <div className="glass-panel p-6 mb-8 border-l-4" style={{ borderColor: 'var(--accent)' }}>
        <h3 className="mb-4">Personal Details</h3>
        <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Fill in your details to get more personalized suggestions from the AI Coaching Engine.
        </p>
        <form onSubmit={handleUpdateProfile} className="grid grid-cols-2 md-grid-cols-4 gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
            <input type="text" className="w-full p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Age</label>
            <input type="number" className="w-full p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Height (cm)</label>
            <input type="number" className="w-full p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Weight (kg)</label>
            <input type="number" className="w-full p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} />
          </div>
          <div className="col-span-full mt-2 flex items-center gap-4">
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Details'}
            </button>
            {profileMessage && <span style={{ color: profileMessage.includes('Error') ? '#f87171' : '#4ade80' }}>{profileMessage}</span>}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {routines.map((routine, index) => (
          <div 
            key={routine._id} 
            className={`card glass-panel flex flex-col justify-between delay-${(index % 3) * 100}`}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/workout', { state: { routine } })}
          >
            <div>
              <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--primary)' }}>
                <Calendar size={24} />
                <h3 style={{ margin: 0 }}>{routine.dayOfWeek}</h3>
              </div>
              <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
                {routine.bodyParts.map((part) => (
                  <span 
                    key={part} 
                    style={{ 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: 'rgba(99, 102, 241, 0.2)', 
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      color: 'var(--primary)',
                      fontWeight: '500'
                    }}
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-4" style={{ color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.875rem' }}>{routine.exercises.length} exercises</span>
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
