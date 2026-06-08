import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { User } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    age: '',
    height: '',
    weight: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/auth/profile`, config);
        setProfile({
          username: data.username || '',
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

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/auth/profile`, profile, config);
      
      login({ ...user, username: data.username, name: data.name });
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      setProfileMessage(error.response?.data?.message || 'Error updating profile');
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
        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Username</label>
            <input type="text" name="username" className="w-full p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={profile.username} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
            <input type="text" name="name" className="w-full p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={profile.name} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Age</label>
            <input type="number" name="age" className="w-full p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={profile.age} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Height (cm)</label>
            <input type="number" name="height" className="w-full p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={profile.height} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Weight (kg)</label>
            <input type="number" name="weight" className="w-full p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={profile.weight} onChange={handleChange} />
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
