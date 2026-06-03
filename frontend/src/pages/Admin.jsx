import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { ShieldAlert, Trash2 } from 'lucide-react';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [usersRes, logsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/admin/users', config),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '/api/admin/logs', config)
        ]);
        setUsers(usersRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5005/api/admin/users/${id}`, config);
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="container mt-8 text-center text-danger">Access Denied. Admins only.</div>;
  }

  if (loading) return <div className="container flex justify-center mt-8">Loading...</div>;

  return (
    <div className="container animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <ShieldAlert size={32} color="var(--danger)" />
        <div>
          <h1 style={{ margin: 0 }}>Admin Panel</h1>
          <p>Manage users and system logs</p>
        </div>
      </div>

      <div className="grid gap-8">
        <div className="glass-panel p-6">
          <h2 className="mb-4">Users ({users.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td className="p-3">{u.username || '-'}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)', color: u.role === 'admin' ? 'var(--danger)' : 'var(--primary)', fontSize: '0.875rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDeleteUser(u._id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="mb-4">System Workout Logs ({logs.length})</h2>
          <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="p-3">User</th>
                  <th className="p-3">Exercise</th>
                  <th className="p-3">Sets Logged</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td className="p-3">{log.userId?.email || 'Unknown User'}</td>
                    <td className="p-3">{log.exerciseId?.name || 'Unknown Exercise'}</td>
                    <td className="p-3">{log.sets.length}</td>
                    <td className="p-3">{new Date(log.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
