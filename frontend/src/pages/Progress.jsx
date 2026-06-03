import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Trash2 } from 'lucide-react';

const Progress = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/workout/progress', config);
        setLogs(data);
        if (data.length > 0) {
          // Find first exercise ID to default select
          setSelectedExercise(data[0].exerciseId._id);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProgress();
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

  // Format data for Recharts
  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    
    const filteredLogs = logs.filter(log => log.exerciseId?._id === selectedExercise);
    return filteredLogs.map(log => {
      // Find max weight in the sets for that day
      const maxWeight = Math.max(...log.sets.map(set => set.weight || 0));
      return {
        date: new Date(log.date).toLocaleDateString(),
        maxWeight: maxWeight,
      };
    });
  }, [logs, selectedExercise]);

  if (loading) return <div className="container flex justify-center mt-8">Loading...</div>;

  return (
    <div className="container animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <TrendingUp size={32} color="var(--accent)" />
        <div>
          <h1 style={{ margin: 0 }}>Progress Dashboard</h1>
          <p>Track your strength gains over time</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="glass-panel text-center py-8">
          <p>No workout logs found. Start working out to see your progress!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          <div className="glass-panel p-6 col-span-full md-col-span-1">
            <h3 className="mb-4">Select Exercise</h3>
            <div className="flex flex-col gap-2">
              {exercises.map(ex => (
                <button
                  key={ex._id}
                  className={`btn ${selectedExercise === ex._id ? 'btn-primary' : 'btn-outline'} w-full`}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setSelectedExercise(ex._id)}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="glass-panel p-6 col-span-full md-col-span-2">
            <h3 className="mb-4">Max Weight Trend</h3>
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
                  <Line type="monotone" dataKey="maxWeight" name="Max Weight" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6, fill: 'var(--primary)' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workout History Table */}
          <div className="glass-panel p-6 mt-8 col-span-full md-col-span-3">
            <h3 className="mb-4">Recent Workout History</h3>
            <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="p-3">Date</th>
                    <th className="p-3">Exercise</th>
                    <th className="p-3">Sets Logged</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td className="p-3">{new Date(log.date).toLocaleString()}</td>
                      <td className="p-3">{log.exerciseId?.name || 'Unknown Exercise'}</td>
                      <td className="p-3">{log.sets.length}</td>
                      <td className="p-3 text-right">
                        <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDeleteLog(log._id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Progress;
