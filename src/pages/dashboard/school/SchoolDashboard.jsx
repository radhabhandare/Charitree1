import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolDashboard.css';

const SchoolDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalDonations: 0,
      pendingNeeds: 0,
      fulfilledNeeds: 0,
      totalItemsReceived: 0,
      activeRequests: 0
    },
    recentDonations: [],
    pendingNeeds: [],
    recentMessages: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Real API calls - these endpoints need to be created in backend
      const [statsRes, donationsRes, needsRes, messagesRes] = await Promise.all([
        api.get('/school/stats', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/school/donations/recent', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/school/needs/pending', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/school/messages/recent', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setDashboardData({
        stats: statsRes.data,
        recentDonations: donationsRes.data,
        pendingNeeds: needsRes.data,
        recentMessages: messagesRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Only use mock if API fails, but prefer real data
      setDashboardData({
        stats: {
          totalDonations: 0,
          pendingNeeds: user?.profile?.needs?.length || 0,
          fulfilledNeeds: 0,
          totalItemsReceived: 0,
          activeRequests: 0
        },
        recentDonations: [],
        pendingNeeds: user?.profile?.needs?.filter(n => n.status === 'pending') || [],
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
      'processing': '#2196f3',
      'shipped': '#1976d2',
      'delivered': '#2e7d32',
      'cancelled': '#d32f2f'
    };
    return colors[status] || '#666';
  };

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'high': return <span className="urgency-high">🔴 High Priority</span>;
      case 'medium': return <span className="urgency-medium">🟡 Medium Priority</span>;
      case 'low': return <span className="urgency-low">🟢 Low Priority</span>;
      default: return <span className="urgency-medium">🟡 Medium</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="school-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="school-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Welcome, {user?.profile?.schoolName || 'School'}!</h1>
          <p className="school-location">{user?.profile?.address?.city}, {user?.profile?.address?.state}</p>
          {user?.profile?.verificationStatus === 'verified' && (
            <span className="verified-badge">✓ Verified School</span>
          )}
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={() => navigate('/school/messages')}>
            <span>💬</span>
            {dashboardData.recentMessages.filter(m => !m.read).length > 0 && (
              <span className="badge">{dashboardData.recentMessages.filter(m => !m.read).length}</span>
            )}
          </button>
          <button className="icon-btn" onClick={() => navigate('/school/profile')}>
            <span>👤</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/school/donations')}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Donations</h3>
            <p className="stat-value">{dashboardData.stats.totalDonations}</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/school/needs')}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Pending Needs</h3>
            <p className="stat-value">{dashboardData.stats.pendingNeeds}</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/school/needs')}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Fulfilled Needs</h3>
            <p className="stat-value">{dashboardData.stats.fulfilledNeeds}</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/school/donations')}>
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Items Received</h3>
            <p className="stat-value">{dashboardData.stats.totalItemsReceived}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn primary" onClick={() => navigate('/school/needs/create')}>
          <span>➕</span> Post New Need
        </button>
        <button className="action-btn" onClick={() => navigate('/school/needs')}>
          <span>📋</span> Manage Needs
        </button>
        <button className="action-btn" onClick={() => navigate('/school/donations')}>
          <span>📦</span> View Donations
        </button>
        <button className="action-btn" onClick={() => navigate('/school/messages')}>
          <span>💬</span> Messages
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Donations */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Donations</h2>
            <button className="view-all" onClick={() => navigate('/school/donations')}>
              View All →
            </button>
          </div>
          
          <div className="donations-list">
            {dashboardData.recentDonations.length > 0 ? (
              dashboardData.recentDonations.map(donation => (
                <div key={donation.id} className="donation-item">
                  <div className="donation-info">
                    <h3>{donation.donorName || 'Anonymous Donor'}</h3>
                    <p className="donation-items">{donation.items?.join(', ')}</p>
                    <span className="donation-date">{formatDate(donation.date)}</span>
                  </div>
                  <div className="donation-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(donation.status) }}
                    >
                      {donation.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No donations yet.</p>
                <span>Donors will appear here once they donate.</span>
              </div>
            )}
          </div>
        </div>

        {/* Pending Needs */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Pending Needs</h2>
            <button className="view-all" onClick={() => navigate('/school/needs')}>
              Manage All →
            </button>
          </div>
          
          <div className="needs-list">
            {dashboardData.pendingNeeds.length > 0 ? (
              dashboardData.pendingNeeds.map(need => (
                <div key={need.id} className="need-item">
                  <div className="need-info">
                    <h3>{need.item}</h3>
                    <p className="need-quantity">Quantity: {need.quantity}</p>
                    {getUrgencyBadge(need.urgency)}
                  </div>
                  <div className="need-status">
                    <span className="status-pending">Pending</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No pending needs.</p>
                <button className="add-need-btn" onClick={() => navigate('/school/needs/create')}>
                  + Add New Need
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="dashboard-card full-width">
          <div className="card-header">
            <h2>Recent Messages</h2>
            <button className="view-all" onClick={() => navigate('/school/messages')}>
              View All →
            </button>
          </div>
          
          <div className="messages-list">
            {dashboardData.recentMessages.length > 0 ? (
              dashboardData.recentMessages.map(message => (
                <div key={message.id} className={`message-item ${!message.read ? 'unread' : ''}`}>
                  <div className="message-avatar">
                    <span>👤</span>
                  </div>
                  <div className="message-info">
                    <h4>{message.senderName}</h4>
                    <p>{message.message}</p>
                    <span className="message-time">{formatDate(message.time)}</span>
                  </div>
                  {!message.read && <span className="unread-dot"></span>}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No messages yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;