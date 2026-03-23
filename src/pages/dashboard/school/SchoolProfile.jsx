import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolProfile.css';

const SchoolProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    schoolName: '',
    schoolType: '',
    establishmentYear: '',
    principalName: '',
    phoneNumber: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      location: ''
    },
    studentCount: '',
    teacherCount: '',
    description: '',
    needs: []
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/school/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use real data from auth context
      if (user?.profile) {
        setProfile({
          schoolName: user.profile.schoolName || '',
          schoolType: user.profile.schoolType || '',
          establishmentYear: user.profile.establishmentYear || '',
          principalName: user.profile.principalName || '',
          phoneNumber: user.profile.phoneNumber || '',
          email: user.email || '',
          address: user.profile.address || { street: '', city: '', state: '', pincode: '', location: '' },
          studentCount: user.profile.studentCount || '',
          teacherCount: user.profile.teacherCount || '',
          description: user.profile.description || '',
          needs: user.profile.needs || []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await api.put('/school/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setProfile({
        ...profile,
        address: { ...profile.address, [field]: value }
      });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  if (loading) {
    return (
      <div className="school-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="school-profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/school/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>School Profile</h1>
        {!editMode ? (
          <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={() => { setEditMode(false); fetchProfile(); }}>Cancel</button>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>School Name</label>
              <input type="text" name="schoolName" value={profile.schoolName} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>School Type</label>
              <select name="schoolType" value={profile.schoolType} onChange={handleChange} disabled={!editMode}>
                <option value="private">Private</option>
                <option value="government">Government</option>
                <option value="semi-government">Semi-Government</option>
              </select>
            </div>
            <div className="form-group">
              <label>Establishment Year</label>
              <input type="number" name="establishmentYear" value={profile.establishmentYear} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>Principal Name</label>
              <input type="text" name="principalName" value={profile.principalName} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={profile.email} disabled={true} />
              <small>Email cannot be changed</small>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Address Information</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Street Address</label>
              <input type="text" name="address.street" value={profile.address?.street || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" name="address.city" value={profile.address?.city || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" name="address.state" value={profile.address?.state || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input type="text" name="address.pincode" value={profile.address?.pincode || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="form-group full-width">
              <label>Google Maps Location</label>
              <input type="text" name="address.location" value={profile.address?.location || ''} onChange={handleChange} disabled={!editMode} placeholder="Paste Google Maps link" />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>School Statistics</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Number of Students</label>
              <input type="number" name="studentCount" value={profile.studentCount} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>Number of Teachers</label>
              <input type="number" name="teacherCount" value={profile.teacherCount} onChange={handleChange} disabled={!editMode} />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>About School</h3>
          <div className="form-group">
            <textarea name="description" value={profile.description} onChange={handleChange} disabled={!editMode} rows="5" placeholder="Tell donors about your school..." />
          </div>
        </div>

        <div className="profile-section">
          <h3>Current Needs</h3>
          <div className="needs-list">
            {profile.needs?.length > 0 ? (
              profile.needs.map((need, idx) => (
                <div key={idx} className="need-tag">
                  {need.item} ({need.quantity})
                </div>
              ))
            ) : (
              <p className="no-needs">No needs posted yet. Go to "School Needs" to add some.</p>
            )}
          </div>
          <button className="manage-needs-btn" onClick={() => navigate('/school/needs')}>
            Manage Needs →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolProfile;