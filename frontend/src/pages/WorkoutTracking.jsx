import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';

const WorkoutTracking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const routine = state?.routine;

  const [selectedBodyPart, setSelectedBodyPart] = useState(routine?.bodyParts[0] || '');
  const [logs, setLogs] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!routine) {
    return (
      <div className="container text-center mt-8">
        <h2>No routine selected</h2>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  const exercises = routine.exercises.filter(ex => ex.bodyPart === selectedBodyPart);

  const handleInputChange = (exerciseId, setIndex, field, value) => {
    setLogs(prev => {
      const exLogs = prev[exerciseId] || Array(routine.exercises.find(e => e._id === exerciseId).defaultSets).fill({ reps: '', weight: 0 });
      const newExLogs = [...exLogs];
      newExLogs[setIndex] = { ...newExLogs[setIndex], [field]: value };
      return { ...prev, [exerciseId]: newExLogs };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = [];
      
      Object.keys(logs).forEach(exerciseId => {
        const validSets = logs[exerciseId].filter(set => set.reps && set.weight !== undefined);
        if (validSets.length > 0) {
          payload.push({ exerciseId, sets: validSets });
        }
      });

      if (payload.length > 0) {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/workout/logs', { logs: payload }, config);
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving logs:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <button className="btn btn-outline mb-6" onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>{routine.dayOfWeek}</h1>
          <p>Track your sets, reps, and weights.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {routine.bodyParts.map(part => (
          <button
            key={part}
            className={`btn ${selectedBodyPart === part ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedBodyPart(part)}
          >
            {part}
          </button>
        ))}
      </div>

      {success ? (
        <div className="glass-panel text-center py-8" style={{ borderColor: 'var(--accent)' }}>
          <CheckCircle size={48} color="var(--accent)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--accent)' }}>Workout Saved!</h2>
          <p>Great job! Returning to dashboard...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {exercises.map((exercise, index) => (
            <div key={exercise._id} className={`card glass-panel delay-${(index % 3) * 100}`}>
              <h3 className="mb-4">{exercise.name} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({exercise.defaultSets} sets x {exercise.defaultReps})</span></h3>
              
              <div className="flex flex-col gap-4">
                {Array.from({ length: exercise.defaultSets }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <span style={{ color: 'var(--text-muted)', width: '40px' }}>Set {i + 1}</span>
                    <select
                      className="form-control"
                      value={logs[exercise._id]?.[i]?.reps || ''}
                      onChange={(e) => handleInputChange(exercise._id, i, 'reps', e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="" disabled>Select Reps</option>
                      {Array.from({ length: 15 }, (_, idx) => idx + 1).map(rep => (
                        <option key={rep} value={rep}>{rep} Reps</option>
                      ))}
                    </select>
                    <select
                      className="form-control"
                      value={logs[exercise._id]?.[i]?.weight || ''}
                      onChange={(e) => handleInputChange(exercise._id, i, 'weight', e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="" disabled>Select Weight</option>
                      <option value="0">Bodyweight (0 kg)</option>
                      {Array.from({ length: Math.floor(140 / 2.5) }, (_, idx) => (idx + 1) * 2.5).map(weight => (
                        <option key={weight} value={weight}>{weight} kg</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4 flex justify-end">
            <button 
              className="btn btn-primary" 
              onClick={handleSave} 
              disabled={saving}
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Finish & Save Workout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTracking;
