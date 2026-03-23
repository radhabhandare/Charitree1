import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSchools: 0,
    totalDonors: 0,
    totalCampaigns: 0,
    pendingSchools: 0,
    verifiedSchools: 0,
    pendingCampaigns: 0,
    verifiedCampaigns: 0,
    recentUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [activities, setActivities] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [statsRes, activitiesRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activities'),
        api.get('/admin/users')
      ]);

      setStats(statsRes.data.stats);
      setActivities(activitiesRes.data.activities);
      
      // Get 5 most recent users
      const recent = usersRes.data.users.slice(0, 5);
      setRecentUsers(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return '#2e7d32';
      case 'pending': return '#ff9800';
      case 'rejected': return '#d32f2f';
      default: return '#666';
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header with Admin Info */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p className="welcome-text">
            Welcome back, <strong>{user?.profile?.fullName || 'Admin'}</strong>
          </p>
          <p className="email-text">{user?.email}</p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <div className="stat-breakdown">
              <span>Active: {stats.activeUsers}</span>
              <span>Inactive: {stats.inactiveUsers}</span>
            </div>
          </div>
        </div>

        <div className="stat-card schools">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>Schools</h3>
            <p className="stat-value">{stats.totalSchools}</p>
            <div className="stat-breakdown">
              <span>Verified: {stats.verifiedSchools}</span>
              <span>Pending: {stats.pendingSchools}</span>
            </div>
          </div>
        </div>

        <div className="stat-card donors">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <h3>Donors</h3>
            <p className="stat-value">{stats.totalDonors}</p>
            <div className="stat-breakdown">
              <span>New this week: {stats.recentDonors || 0}</span>
            </div>
          </div>
        </div>

        <div className="stat-card campaigns">
          <div className="stat-icon">📢</div>
          <div className="stat-content">
            <h3>Campaigns</h3>
            <p className="stat-value">{stats.totalCampaigns}</p>
            <div className="stat-breakdown">
              <span>Verified: {stats.verifiedCampaigns}</span>
              <span>Pending: {stats.pendingCampaigns}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <button 
            className="action-card verify"
            onClick={() => navigate('/admin/verifications')}
          >
            <span className="action-icon">✅</span>
            <h3>Verify Schools</h3>
            {stats.pendingSchools > 0 && (
              <span className="badge">{stats.pendingSchools} pending</span>
            )}
          </button>

          <button 
            className="action-card users"
            onClick={() => navigate('/admin/users')}
          >
            <span className="action-icon">👥</span>
            <h3>Manage Users</h3>
          </button>

          <button 
            className="action-card reports"
            onClick={() => navigate('/admin/reports')}
          >
            <span className="action-icon">📊</span>
            <h3>View Reports</h3>
          </button>

          <button 
            className="action-card settings"
            onClick={() => navigate('/admin/settings')}
          >
            <span className="action-icon">⚙️</span>
            <h3>Settings</h3>
          </button>
        </div>
      </div>

      {/* Recent Activity and Users */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="recent-activity-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type.includes('school') ? '🏫' : 
                     activity.type.includes('donor') ? '❤️' : '📢'}
                  </div>
                  <div className="activity-details">
                    <p className="activity-title">{activity.title}</p>
                    <p className="activity-desc">{activity.description}</p>
                    <span className="activity-time">
                      {new Date(activity.time).toLocaleString()}
                    </span>
                  </div>
                  {activity.status && (
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(activity.status) }}
                    >
                      {activity.status}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="no-data">No recent activities</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="recent-users-card">
          <h2>Recent Registrations</h2>
          <div className="users-list">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user._id} className="user-item">
                  <div className="user-avatar">
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="user-info">
                    <p className="user-name">
                      {user.profile?.schoolName || 
                       user.profile?.fullName || 
                       user.profile?.organizationName || 
                       user.email}
                    </p>
                    <p className="user-email">{user.email}</p>
                    <div className="user-meta">
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                      <span className={`status-dot ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <span className="join-date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data">No recent users</p>
            )}
          </div>
          <button 
            className="view-all-btn"
            onClick={() => navigate('/admin/users')}
          >
            View All Users →
          </button>
        </div>
      </div>

      {/* Pending Verifications Alert */}
      {(stats.pendingSchools > 0 || stats.pendingCampaigns > 0) && (
        <div className="verification-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3>Pending Verifications</h3>
            <p>
              {stats.pendingSchools} school{stats.pendingSchools !== 1 ? 's' : ''} and{' '}
              {stats.pendingCampaigns} campaign{stats.pendingCampaigns !== 1 ? 's' : ''} awaiting approval
            </p>
          </div>
          <button 
            className="alert-action"
            onClick={() => navigate('/admin/verifications')}
          >
            Review Now →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;