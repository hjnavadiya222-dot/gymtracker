import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Trash2, Bot, Activity, Edit, Check, X, Plus } from 'lucide-react';

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const Progress = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [cardioLogs, setCardioLogs] = useState([]);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editSets, setEditSets] = useState([]);
  const [editingCardioId, setEditingCardioId] = useState(null);
  const [editCardio, setEditCardio] = useState({ distance: '', calories: '', duration: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/workout/progress`, config);
        setLogs(data);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/workout/analytics`, config);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    const fetchCardio = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/workout/cardio`, config);
        setCardioLogs(data);
      } catch (error) {
        console.error('Error fetching cardio:', error);
      }
    };

    if (user) {
      fetchProgress();
      fetchAnalytics();
      fetchCardio();
    }
  }, [user]);

  const handleDeleteLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout log?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/workout/logs/${id}`, config);
        setLogs(logs.filter(log => log._id !== id));
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    }
  };

  const handleEditClick = (log) => {
    setEditingLogId(log._id);
    setEditSets(JSON.parse(JSON.stringify(log.sets)));
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setEditSets([]);
  };

  const handleSaveEdit = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/workout/logs/${id}`, { sets: editSets }, config);
      setLogs(logs.map(log => log._id === id ? { ...log, sets: editSets } : log));
      setEditingLogId(null);
      setEditSets([]);
    } catch (error) {
      console.error('Error updating log:', error);
      alert('Failed to update log');
    }
  };

  const handleSetChange = (index, field, value) => {
    const newSets = [...editSets];
    newSets[index][field] = value;
    setEditSets(newSets);
  };

  const handleAddSet = () => {
    setEditSets([...editSets, { reps: '', weight: 0 }]);
  };

  const handleRemoveSet = (index) => {
    const newSets = [...editSets];
    newSets.splice(index, 1);
    setEditSets(newSets);
  };

  const handleDeleteCardio = async (id) => {
    if (window.confirm('Are you sure you want to delete this cardio log?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/workout/cardio/${id}`, config);
        setCardioLogs(cardioLogs.filter(log => log._id !== id));
      } catch (error) {
        console.error('Error deleting cardio log:', error);
      }
    }
  };

  const handleEditCardioClick = (log) => {
    setEditingCardioId(log._id);
    setEditCardio({
      distance: log.distance,
      calories: log.calories,
      duration: log.duration,
    });
  };

  const handleCancelCardioEdit = () => {
    setEditingCardioId(null);
    setEditCardio({ distance: '', calories: '', duration: '' });
  };

  const handleSaveCardioEdit = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/workout/cardio/${id}`, editCardio, config);
      setCardioLogs(cardioLogs.map(log => log._id === id ? data : log));
      setEditingCardioId(null);
      setEditCardio({ distance: '', calories: '', duration: '' });
    } catch (error) {
      console.error('Error updating cardio log:', error);
      alert('Failed to update cardio log');
    }
  };

  const handleCardioChange = (field, value) => {
    setEditCardio({ ...editCardio, [field]: value });
  };

  // Extract unique exercises from logs
  const exercises = useMemo(() => {
    const unique = [];
    const map = new Map();
    for (const log of logs) {
      if (log.exerciseId && !map.has(log.exerciseId._id)) {
        map.set(log.exerciseId._id, true);
        unique.push(log.exerciseId);
      }
    }
    return unique;
  }, [logs]);

  // Format data for Recharts to show all exercises
  const chartData = useMemo(() => {
    const dataByDate = {};
    
    logs.forEach(log => {
      const dateStr = formatDate(log.date);
      if (!dataByDate[dateStr]) {
        dataByDate[dateStr] = { date: dateStr, rawDate: log.date };
      }
      const maxWeight = Math.max(...log.sets.map(set => set.weight || 0));
      const exName = log.exerciseId?.name || 'Unknown';
      if (!dataByDate[dateStr][exName] || dataByDate[dateStr][exName] < maxWeight) {
        dataByDate[dateStr][exName] = maxWeight;
      }
    });
    
    return Object.values(dataByDate).sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  }, [logs]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#a4de6c', '#d0ed57', '#8dd1e1', '#83a6ed', '#8d6e63', '#d4e157'];

  if (loading || analyticsLoading) return <div className="container flex justify-center mt-8">Loading...</div>;

  return (
    <div className="container animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <TrendingUp size={32} color="var(--accent)" />
        <div>
          <h1 style={{ margin: 0 }}>Progress Dashboard</h1>
          <p>Track your strength gains over time</p>
        </div>
      </div>

      {analytics && (
        <div className="glass-panel p-6 mb-8 border-l-4" style={{ borderColor: 'var(--accent)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Bot size={28} color="var(--accent)" />
            <h2 style={{ margin: 0 }}>AI Analytics & Coaching Engine</h2>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-bold">Progress Status</h3>
            <p className="text-xl" style={{ color: 'var(--primary)' }}>{analytics.progress_status}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Coaching Tips</h3>
            <ul className="list-disc pl-5">
              {analytics.coaching_tips.map((tip, index) => (
                <li key={index} className="mb-1">{tip}</li>
              ))}
            </ul>
          </div>
          
          {analytics.weekly_summary.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Weekly e1RM Comparison</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="p-2">Exercise</th>
                      <th className="p-2">Body Part</th>
                      <th className="p-2">Last Week e1RM</th>
                      <th className="p-2">This Week e1RM</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.weekly_summary.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td className="p-2">{item.exerciseName}</td>
                        <td className="p-2">{item.bodyPart}</td>
                        <td className="p-2">{item.lastWeekE1RM} kgs</td>
                        <td className="p-2">{item.currentWeekE1RM} kgs</td>
                        <td className="p-2 font-bold" style={{
                          color: item.status === 'Increased' ? '#4ade80' : item.status === 'Decreased' ? '#f87171' : 'var(--text-muted)'
                        }}>{item.status}</td>
                        <td className="p-2">{item.percentageChange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="glass-panel text-center py-8">
          <p>No workout logs found. Start working out to see your progress!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          <div className="glass-panel p-6 col-span-full md-col-span-3">
            <h3 className="mb-4">Max Weight Trend (All Exercises)</h3>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                  <Legend />
                  {exercises.map((ex, index) => (
                    <Line 
                      key={ex._id}
                      type="monotone" 
                      dataKey={ex.name} 
                      name={ex.name} 
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={2} 
                      connectNulls={true}
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Previous vs Current Strength Chart */}
          {analytics && analytics.weekly_summary && analytics.weekly_summary.length > 0 && (
            <div className="glass-panel p-6 mt-8 col-span-full md-col-span-3">
              <h3 className="mb-4">Previous vs Current Strength (e1RM)</h3>
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.weekly_summary} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="exerciseName" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Legend />
                    <Bar dataKey="lastWeekE1RM" name="Previous Week e1RM" fill="var(--text-muted)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="currentWeekE1RM" name="Current Week e1RM" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Workout History Table */}
          <div className="glass-panel p-6 mt-8 col-span-full md-col-span-3">
            <h3 className="mb-4">Recent Workout History</h3>
            <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="p-3">Date</th>
                    <th className="p-3">Exercise</th>
                    <th className="p-3">Sets</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...logs].sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => (
                    <tr key={log._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td className="p-3">{formatDate(log.date)} {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="p-3">{log.exerciseId?.name || 'Unknown Exercise'}</td>
                      <td className="p-3">
                        {editingLogId === log._id ? (
                          <div className="flex flex-col gap-2">
                            {editSets.map((set, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input
                                  type="number"
                                  className="p-1 rounded bg-black/20 border border-[var(--border)] w-16"
                                  placeholder="Kgs"
                                  value={set.weight}
                                  onChange={(e) => handleSetChange(idx, 'weight', Number(e.target.value))}
                                />
                                <span>kgs ×</span>
                                <input
                                  type="text"
                                  className="p-1 rounded bg-black/20 border border-[var(--border)] w-16"
                                  placeholder="Reps"
                                  value={set.reps}
                                  onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                                />
                                <button className="btn btn-outline" style={{ padding: '0.2rem' }} onClick={() => handleRemoveSet(idx)}>
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', width: 'fit-content' }} onClick={handleAddSet}>
                              <Plus size={14} className="inline mr-1" /> Add Set
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {log.sets.map((set, idx) => (
                              <div key={idx} className="text-sm">
                                Set {idx + 1}: {set.weight} kgs × {set.reps} reps
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right" style={{ verticalAlign: 'top' }}>
                        {editingLogId === log._id ? (
                          <div className="flex justify-end gap-2">
                            <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={() => handleSaveEdit(log._id)}>
                              <Check size={16} />
                            </button>
                            <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={handleCancelEdit}>
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => handleEditClick(log)}>
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDeleteLog(log._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cardio History Table */}
          {cardioLogs.length > 0 && (
            <div className="glass-panel p-6 mt-8 col-span-full md-col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={24} color="var(--accent)" />
                <h3 style={{ margin: 0 }}>Recent Cardio History</h3>
              </div>
              <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="p-3">Date</th>
                      <th className="p-3">Distance (km)</th>
                      <th className="p-3">Calories</th>
                      <th className="p-3">Time (min)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...cardioLogs].sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => (
                      <tr key={log._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td className="p-3" style={{ verticalAlign: editingCardioId === log._id ? 'middle' : 'top' }}>{formatDate(log.date)} {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td className="p-3">
                          {editingCardioId === log._id ? (
                            <input
                              type="number"
                              className="p-1 rounded bg-black/20 border border-[var(--border)] w-24"
                              value={editCardio.distance}
                              onChange={(e) => handleCardioChange('distance', Number(e.target.value))}
                            />
                          ) : (
                            log.distance
                          )}
                        </td>
                        <td className="p-3">
                          {editingCardioId === log._id ? (
                            <input
                              type="number"
                              className="p-1 rounded bg-black/20 border border-[var(--border)] w-24"
                              value={editCardio.calories}
                              onChange={(e) => handleCardioChange('calories', Number(e.target.value))}
                            />
                          ) : (
                            log.calories
                          )}
                        </td>
                        <td className="p-3">
                          {editingCardioId === log._id ? (
                            <input
                              type="number"
                              className="p-1 rounded bg-black/20 border border-[var(--border)] w-24"
                              value={editCardio.duration}
                              onChange={(e) => handleCardioChange('duration', Number(e.target.value))}
                            />
                          ) : (
                            log.duration
                          )}
                        </td>
                        <td className="p-3 text-right" style={{ verticalAlign: 'top' }}>
                          {editingCardioId === log._id ? (
                            <div className="flex justify-end gap-2">
                              <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={() => handleSaveCardioEdit(log._id)}>
                                <Check size={16} />
                              </button>
                              <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={handleCancelCardioEdit}>
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => handleEditCardioClick(log)}>
                                <Edit size={16} />
                              </button>
                              <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDeleteCardio(log._id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Progress;
