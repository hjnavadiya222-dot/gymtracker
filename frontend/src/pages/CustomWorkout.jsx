import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Save, ArrowLeft, CheckCircle, Plus } from 'lucide-react';

const CustomWorkout = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for adding an exercise block
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [numSets, setNumSets] = useState(3);

  // Active workout session blocks
  const [sessionBlocks, setSessionBlocks] = useState([]);
  const [logs, setLogs] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5005/api/workout/exercises', config);
        setAllExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchExercises();
  }, [user]);

  const bodyParts = [...new Set(allExercises.map(ex => ex.bodyPart))];
  const filteredExercises = allExercises.filter(ex => ex.bodyPart === selectedBodyPart);

  const handleAddBlock = () => {
    if (!selectedExerciseId || !numSets) return;
    
    const exercise = allExercises.find(ex => ex._id === selectedExerciseId);
    
    const newBlock = {
      ...exercise,
      assignedSets: Number(numSets),
      blockId: Date.now().toString() // Unique ID in case same exercise is added twice
    };

    setSessionBlocks([...sessionBlocks, newBlock]);
    
    // Initialize empty logs for this block
    setLogs(prev => ({
      ...prev,
      [newBlock.blockId]: Array(Number(numSets)).fill({ reps: '', weight: 0 })
    }));

    // Reset form
    setSelectedExerciseId('');
  };

  const handleInputChange = (blockId, setIndex, field, value) => {
    setLogs(prev => {
      const blockLogs = [...prev[blockId]];
      blockLogs[setIndex] = { ...blockLogs[setIndex], [field]: value };
      return { ...prev, [blockId]: blockLogs };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = [];
      
      sessionBlocks.forEach(block => {
        const blockLogs = logs[block.blockId];
        const validSets = blockLogs.filter(set => set.reps && set.weight !== undefined && set.weight !== '');
        
        if (validSets.length > 0) {
          payload.push({ exerciseId: block._id, sets: validSets });
        }
      });

      if (payload.length > 0) {
        await axios.post('http://localhost:5005/api/workout/logs', { logs: payload }, config);
        setSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      } else {
        alert("Please enter some reps and weight before saving.");
      }
    } catch (error) {
      console.error('Error saving logs:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container mt-8 text-center">Loading Exercises...</div>;

  return (
    <div className="container animate-fade-in">
      <button className="btn btn-outline mb-6" onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="mb-8">
        <h1>Custom Workout</h1>
        <p>Build your routine dynamically.</p>
      </div>

      {success ? (
        <div className="glass-panel text-center py-8" style={{ borderColor: 'var(--accent)' }}>
          <CheckCircle size={48} color="var(--accent)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--accent)' }}>Workout Saved!</h2>
          <p>Great job! Returning to dashboard...</p>
        </div>
      ) : (
        <>
          {/* Workout Builder Form */}
          <div className="glass-panel p-6 mb-8 flex flex-col gap-4">
            <h3>Add an Exercise</h3>
            <div className="grid grid-cols-3 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="form-group mb-0">
                <label className="form-label">Body Part</label>
                <select 
                  className="form-control" 
                  value={selectedBodyPart} 
                  onChange={(e) => {
                    setSelectedBodyPart(e.target.value);
                    setSelectedExerciseId('');
                  }}
                >
                  <option value="" disabled>Select Body Part</option>
                  {bodyParts.map(bp => (
                    <option key={bp} value={bp}>{bp}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Exercise</label>
                <select 
                  className="form-control" 
                  value={selectedExerciseId} 
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  disabled={!selectedBodyPart}
                >
                  <option value="" disabled>Select Exercise</option>
                  {filteredExercises.map(ex => (
                    <option key={ex._id} value={ex._id}>{ex.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Number of Sets</label>
                <select 
                  className="form-control" 
                  value={numSets} 
                  onChange={(e) => setNumSets(e.target.value)}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} Sets</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              className="btn btn-outline mt-2 w-full justify-center" 
              onClick={handleAddBlock}
              disabled={!selectedExerciseId}
            >
              <Plus size={18} /> Add to Session
            </button>
          </div>

          {/* Active Workout Session */}
          {sessionBlocks.length > 0 && (
            <div className="grid gap-6">
              <h2 className="mt-4">Active Session</h2>
              
              {sessionBlocks.map((block) => (
                <div key={block.blockId} className="card glass-panel">
                  <h3 className="mb-4">{block.name} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({block.assignedSets} sets)</span></h3>
                  
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: block.assignedSets }).map((_, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <span style={{ color: 'var(--text-muted)', width: '40px' }}>Set {i + 1}</span>
                        <select
                          className="form-control"
                          value={logs[block.blockId]?.[i]?.reps || ''}
                          onChange={(e) => handleInputChange(block.blockId, i, 'reps', e.target.value)}
                          style={{ flex: 1 }}
                        >
                          <option value="" disabled>Select Reps</option>
                          {Array.from({ length: 15 }, (_, idx) => idx + 1).map(rep => (
                            <option key={rep} value={rep}>{rep} Reps</option>
                          ))}
                        </select>
                        <select
                          className="form-control"
                          value={logs[block.blockId]?.[i]?.weight || ''}
                          onChange={(e) => handleInputChange(block.blockId, i, 'weight', e.target.value)}
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
                  {saving ? 'Saving...' : 'Finish & Save Custom Workout'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomWorkout;
