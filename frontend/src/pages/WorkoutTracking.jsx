import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Save, ArrowLeft, CheckCircle, Activity } from 'lucide-react';

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const WorkoutTracking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const routine = state?.routine;

  const [selectedBodyPart, setSelectedBodyPart] = useState(routine?.bodyParts[0] || '');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/workout/progress`, config);
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
    if (user) {
      fetchHistory();
    }
  }, [user]);
  
  // Initialize from localStorage if available
  const [logs, setLogs] = useState(() => {
    if (!routine) return {};
    const saved = localStorage.getItem("draft_workout_" + routine._id);
    if (saved) {
      try { return JSON.parse(saved); } catch { return {}; }
    }
    return {};
  });

  const [cardio, setCardio] = useState(() => {
    if (!routine) return { distance: '', calories: '', duration: '' };
    const saved = localStorage.getItem("draft_cardio_" + routine._id);
    if (saved) {
      try { return JSON.parse(saved); } catch { return { distance: '', calories: '', duration: '' }; }
    }
    return { distance: '', calories: '', duration: '' };
  });

  useEffect(() => {
    if (routine && Object.keys(logs).length > 0) {
      localStorage.setItem("draft_workout_" + routine._id, JSON.stringify(logs));
    }
  }, [logs, routine]);

  useEffect(() => {
    if (routine && (cardio.distance || cardio.calories || cardio.duration)) {
      localStorage.setItem("draft_cardio_" + routine._id, JSON.stringify(cardio));
    }
  }, [cardio, routine]);
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

  const getLastWorkoutForExercise = (exerciseId) => {
    const exerciseLogs = history
      .filter(log => log.exerciseId?._id === exerciseId || log.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return exerciseLogs[0];
  };

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

      let savedAnything = false;

      if (payload.length > 0) {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/workout/logs', { logs: payload }, config);
        savedAnything = true;
      }

      if (cardio.distance && cardio.calories && cardio.duration) {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/workout/cardio', cardio, config);
        savedAnything = true;
      }

      if (savedAnything) {
        // Clear drafts on success
        localStorage.removeItem("draft_workout_" + routine._id);
        localStorage.removeItem("draft_cardio_" + routine._id);
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        alert("Please enter some reps and weight, or complete the cardio section before saving.");
      }
    } catch (error) {
      console.error('Error saving logs:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all entered data for this workout?")) {
      setLogs({});
      setCardio({ distance: '', calories: '', duration: '' });
      localStorage.removeItem("draft_workout_" + routine._id);
      localStorage.removeItem("draft_cardio_" + routine._id);
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
              
              {/* Previous progress display for progressive overload */}
              {(() => {
                const lastLog = getLastWorkoutForExercise(exercise._id);
                if (lastLog) {
                  return (
                    <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div className="text-sm font-semibold" style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>
                        Last Time ({formatDate(lastLog.date)}):
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {lastLog.sets.map((set, idx) => (
                          <span key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Set {idx + 1}: <strong style={{ color: 'var(--text-main)' }}>{set.weight} kg</strong> × {set.reps} reps
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="mb-4 text-sm" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No previous history found for this exercise.
                  </div>
                );
              })()}
              
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

          <div className="card glass-panel mt-4 mb-2 border-l-4" style={{ borderColor: 'var(--accent)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={24} color="var(--accent)" />
              <h3 className="text-xl m-0">Daily Cardio (Treadmill)</h3>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Distance (km)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={cardio.distance} 
                  onChange={e => setCardio({...cardio, distance: e.target.value})} 
                  placeholder="e.g. 5.2" 
                />
              </div>
              <div>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Calories Burned</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={cardio.calories} 
                  onChange={e => setCardio({...cardio, calories: e.target.value})} 
                  placeholder="e.g. 300" 
                />
              </div>
              <div>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Time (minutes)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={cardio.duration} 
                  onChange={e => setCardio({...cardio, duration: e.target.value})} 
                  placeholder="e.g. 30" 
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-4">
            <button 
              className="btn btn-outline" 
              onClick={handleClear} 
              disabled={saving}
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            >
              Clear Data
            </button>
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
