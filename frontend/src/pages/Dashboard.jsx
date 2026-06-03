import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Calendar, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/workout/routines', config);
        // Sort routines appropriately based on Day 1, Day 2 etc
        setRoutines(data.sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek)));
      } catch (error) {
        console.error('Error fetching routines:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchRoutines();
  }, [user]);

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

      <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
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
