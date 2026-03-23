import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './AdminUsers.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      console.log('📋 Users fetched:', response.data.users);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const response = await api.put(`/admin/toggle-user/${userId}`);
      console.log('✅ User toggled:', response.data);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error toggling user:', error);
      alert('Failed to toggle user status. Please try again.');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'school': return '🏫';
      case 'donor': return '❤️';
      case 'campaign': return '📢';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'school': return 'role-school';
      case 'donor': return 'role-donor';
      case 'campaign': return 'role-campaign';
      case 'admin': return 'role-admin';
      default: return 'role-other';
    }
  };

  const getVerificationBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'verification-pending';
      case 'verified': return 'verification-verified';
      case 'rejected': return 'verification-rejected';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const emailMatch = user.email?.toLowerCase().includes(searchLower);
      const nameMatch = user.profile?.schoolName?.toLowerCase().includes(searchLower) ||
                        user.profile?.fullName?.toLowerCase().includes(searchLower) ||
                        user.profile?.organizationName?.toLowerCase().includes(searchLower);
      return emailMatch || nameMatch;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Manage Users</h1>
        <span className="total-count">Total: {filteredUsers.length} users</span>
      </div>

      <div className="users-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-tabs">
          <button className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => setRoleFilter('all')}>
            All ({users.length})
          </button>
          <button className={`filter-btn ${roleFilter === 'school' ? 'active' : ''}`} onClick={() => setRoleFilter('school')}>
            🏫 Schools ({users.filter(u => u.role === 'school').length})
          </button>
          <button className={`filter-btn ${roleFilter === 'donor' ? 'active' : ''}`} onClick={() => setRoleFilter('donor')}>
            ❤️ Donors ({users.filter(u => u.role === 'donor').length})
          </button>
          <button className={`filter-btn ${roleFilter === 'campaign' ? 'active' : ''}`} onClick={() => setRoleFilter('campaign')}>
            📢 Campaigns ({users.filter(u => u.role === 'campaign').length})
          </button>
          <button className={`filter-btn ${roleFilter === 'admin' ? 'active' : ''}`} onClick={() => setRoleFilter('admin')}>
            👑 Admins ({users.filter(u => u.role === 'admin').length})
          </button>
        </div>
      </div>

      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <span className="user-avatar">{getRoleIcon(user.role)}</span>
                      <div className="user-info">
                        <span className="user-name">
                          {user.profile?.schoolName || 
                           user.profile?.fullName || 
                           user.profile?.organizationName || 
                           user.email.split('@')[0]}
                        </span>
                        {user.role === 'school' && user.profile?.schoolType && (
                          <span className="user-type">{user.profile.schoolType}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="user-email">{user.email}</td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="status-cell">
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.role === 'school' && user.profile?.verificationStatus && (
                        <span className={`verification-badge ${getVerificationBadgeClass(user.profile.verificationStatus)}`}>
                          {user.profile.verificationStatus}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="join-date">{formatDate(user.createdAt)}</td>
                  <td className="action-cell">
                    {user.role !== 'admin' && (
                      <button 
                        className={`toggle-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleUser(user._id)}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    {user.role === 'school' && user.profile?.verificationStatus === 'pending' && (
                      <button 
                        className="verify-btn" 
                        onClick={() => navigate('/admin/verifications')}
                        title="Go to Verifications"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;