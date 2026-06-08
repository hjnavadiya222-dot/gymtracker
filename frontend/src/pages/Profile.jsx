import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { User } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({ name: '', age: '', height: '', weight: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
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

  return (
    <div className="container animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <User size={32} color="var(--accent)" />
        <div>
          <h1 style={{ margin: 0 }}>Your Profile</h1>
          <p>Update your details to get personalized AI suggestions</p>
        </div>
      </div>

      <div className="glass-panel p-6 border-l-4" style={{ borderColor: 'var(--accent)' }}>
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
    </div>
  );
};

export default Profile;
