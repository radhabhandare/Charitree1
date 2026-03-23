import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './DonorDashboard.css';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalDonations: 0,
      schoolsSupported: 0,
      pendingDonations: 0,
      deliveredDonations: 0,
      totalItems: 0
    },
    recentDonations: [],
    recommendedSchools: [],
    recentMessages: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Real API calls
      const [statsRes, donationsRes, schoolsRes, messagesRes] = await Promise.all([
        api.get('/donor/stats', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/donor/donations/recent', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/schools/verified', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/donor/messages/recent', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setDashboardData({
        stats: statsRes.data,
        recentDonations: donationsRes.data,
        recommendedSchools: schoolsRes.data.slice(0, 3),
        recentMessages: messagesRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Show error message to user
      setDashboardData({
        stats: {
          totalDonations: 0,
          schoolsSupported: 0,
          pendingDonations: 0,
          deliveredDonations: 0,
          totalItems: 0
        },
        recentDonations: [],
        recommendedSchools: [],
        recentMessages: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ff9800',
      'accepted': '#2196f3',
      'processing': '#9c27b0',
      'shipped': '#1976d2',
      'delivered': '#2e7d32',
      'cancelled': '#d32f2f'
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'accepted': '✅',
      'processing': '📦',
      'shipped': '🚚',
      'delivered': '🎉',
      'cancelled': '❌'
    };
    return icons[status] || '📋';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="donor-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="donor-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Welcome back, {user?.profile?.fullName || 'Donor'}!</h1>
          <p className="donor-email">{user?.email}</p>
          <div className="donor-badge">
            <span className="badge-icon">⭐</span>
            <span>{dashboardData.stats.totalDonations} donations made</span>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={() => navigate('/donor/messages')}>
            {dashboardData.recentMessages.filter(m => !m.read).length > 0 && (
              <span className="notification-badge">{dashboardData.recentMessages.filter(m => !m.read).length}</span>
            )}
            <span>💬</span>
          </button>
          <button className="icon-btn" onClick={() => navigate('/donor/profile')}>
            <span>👤</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/donor/history')}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Donations</h3>
            <p className="stat-value">{dashboardData.stats.totalDonations}</p>
            <span className="stat-trend">{dashboardData.stats.deliveredDonations} delivered</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/donor/history')}>
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>Schools Supported</h3>
            <p className="stat-value">{dashboardData.stats.schoolsSupported}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/donor/tracking')}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Items</h3>
            <p className="stat-value">{dashboardData.stats.totalItems}</p>
          </div>
        </div>
        <div className="stat-card pending" onClick={() => navigate('/donor/tracking')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>In Transit</h3>
            <p className="stat-value">{dashboardData.stats.pendingDonations}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-btn primary" onClick={() => navigate('/donor/browse')}>
          <span>🔍</span> Browse Schools
        </button>
        <button className="action-btn" onClick={() => navigate('/donor/history')}>
          <span>📋</span> Donation History
        </button>
        <button className="action-btn" onClick={() => navigate('/donor/messages')}>
          <span>💬</span> Messages
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card recent-donations">
          <div className="card-header">
            <h2>Recent Donations</h2>
            <button className="view-all" onClick={() => navigate('/donor/history')}>View All →</button>
          </div>
          <div className="donations-list">
            {dashboardData.recentDonations.length > 0 ? (
              dashboardData.recentDonations.map(donation => (
                <div key={donation.id} className="donation-item" onClick={() => navigate(`/donor/tracking/${donation.id}`)}>
                  <div className="donation-info">
                    <h3>{donation.schoolName}</h3>
                    <p className="donation-date">{formatDate(donation.createdAt)}</p>
                    <div className="donation-items-preview">
                      {donation.items?.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="item-tag">{item.name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="donation-status">
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(donation.status) }}>
                      {getStatusIcon(donation.status)} {donation.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No donations yet. Start by browsing schools!</p>
                <button className="browse-btn" onClick={() => navigate('/donor/browse')}>Browse Schools →</button>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card recommended-schools">
          <div className="card-header">
            <h2>Schools Needing Help</h2>
            <button className="view-all" onClick={() => navigate('/donor/browse')}>Browse All →</button>
          </div>
          <div className="schools-list">
            {dashboardData.recommendedSchools.length > 0 ? (
              dashboardData.recommendedSchools.map(school => (
                <div key={school.id} className="school-item" onClick={() => navigate(`/school/${school.id}`)}>
                  <div className="school-info">
                    <h3>{school.name}</h3>
                    <p className="school-location">{school.location}</p>
                    <p className="school-students">👥 {school.students} students</p>
                    <div className="school-needs-preview">
                      {school.needs?.slice(0, 2).map((need, idx) => (
                        <span key={idx} className="need-tag">{need.item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state"><p>No schools available at the moment.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;