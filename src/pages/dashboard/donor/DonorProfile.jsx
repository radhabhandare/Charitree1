import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './DonorProfile.css';

const DonorProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    occupation: '',
    interests: [],
    bio: '',
    avatar: null,
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      donationUpdates: true,
      newsletter: false
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/donor/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Mock data
      setProfile({
        fullName: user?.profile?.fullName || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        phoneNumber: '+91 9876543210',
        address: '123 Donor Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        occupation: 'Software Engineer',
        interests: ['Education', 'Child Welfare', 'Sports'],
        bio: 'Passionate about making education accessible to every child.',
        avatar: null,
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          donationUpdates: true,
          newsletter: true
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('preferences.')) {
      const prefName = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefName]: checked
        }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInterestToggle = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/donor/profile', profile);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const interestOptions = [
    'Education', 'Child Welfare', 'Sports Development', 
    'Digital Learning', 'Infrastructure', 'Health & Hygiene',
    'Environment', 'Women Empowerment'
  ];

  if (loading) {
    return (
      <div className="donor-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="donor-profile">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/donor/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>My Profile</h1>
        {!editMode ? (
          <button className="edit-btn" onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={() => { setEditMode(false); fetchProfile(); }}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Donation Stats
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-info">
            <div className="avatar-section">
              <div className="avatar-container">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.fullName.charAt(0)}
                  </div>
                )}
                {editMode && (
                  <label className="avatar-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <span className="upload-icon">📷</span>
                  </label>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={true}
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={profile.occupation}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!editMode}
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group full-width">
                <label>Areas of Interest</label>
                <div className="interests-grid">
                  {interestOptions.map(interest => (
                    <label key={interest} className="interest-label">
                      <input
                        type="checkbox"
                        checked={profile.interests.includes(interest)}
                        onChange={() => handleInterestToggle(interest)}
                        disabled={!editMode}
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-section">
            <h3>Notification Preferences</h3>
            <div className="preferences-list">
              <label className="preference-item">
                <input
                  type="checkbox"
                  name="preferences.emailNotifications"
                  checked={profile.preferences.emailNotifications}
                  onChange={handleChange}
                  disabled={!editMode}
                />
                <div>
                  <strong>Email Notifications</strong>
                  <p>Receive email updates about your donations</p>
                </div>
              </label>

              <label className="preference-item">
                <input
                  type="checkbox"
                  name="preferences.smsNotifications"
                  checked={profile.preferences.smsNotifications}
                  onChange={handleChange}
                  disabled={!editMode}
                />
                <div>
                  <strong>SMS Notifications</strong>
                  <p>Get SMS alerts for donation status updates</p>
                </div>
              </label>

              <label className="preference-item">
                <input
                  type="checkbox"
                  name="preferences.donationUpdates"
                  checked={profile.preferences.donationUpdates}
                  onChange={handleChange}
                  disabled={!editMode}
                />
                <div>
                  <strong>Donation Updates</strong>
                  <p>Receive updates when schools receive your donations</p>
                </div>
              </label>

              <label className="preference-item">
                <input
                  type="checkbox"
                  name="preferences.newsletter"
                  checked={profile.preferences.newsletter}
                  onChange={handleChange}
                  disabled={!editMode}
                />
                <div>
                  <strong>Newsletter</strong>
                  <p>Get monthly impact reports and stories</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-section">
            <h3>Change Password</h3>
            <div className="security-form">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" />
              </div>
              <button className="change-password-btn">Update Password</button>
            </div>

            <div className="account-actions">
              <h3>Account Actions</h3>
              <button className="deactivate-btn">Deactivate Account</button>
              <button className="delete-btn">Delete Account</button>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-section">
            <h3>Donation Summary</h3>
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-value">24</div>
                <div className="stat-label">Total Donations</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">8</div>
                <div className="stat-label">Schools Supported</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">450+</div>
                <div className="stat-label">Items Donated</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">850+</div>
                <div className="stat-label">Students Impacted</div>
              </div>
            </div>

            <h3>Category Breakdown</h3>
            <div className="category-breakdown">
              <div className="category-item">
                <span className="category-name">Books</span>
                <div className="category-bar">
                  <div className="bar-fill" style={{ width: '45%' }}></div>
                </div>
                <span className="category-percent">45%</span>
              </div>
              <div className="category-item">
                <span className="category-name">Stationery</span>
                <div className="category-bar">
                  <div className="bar-fill" style={{ width: '30%' }}></div>
                </div>
                <span className="category-percent">30%</span>
              </div>
              <div className="category-item">
                <span className="category-name">Sports</span>
                <div className="category-bar">
                  <div className="bar-fill" style={{ width: '15%' }}></div>
                </div>
                <span className="category-percent">15%</span>
              </div>
              <div className="category-item">
                <span className="category-name">Others</span>
                <div className="category-bar">
                  <div className="bar-fill" style={{ width: '10%' }}></div>
                </div>
                <span className="category-percent">10%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorProfile;