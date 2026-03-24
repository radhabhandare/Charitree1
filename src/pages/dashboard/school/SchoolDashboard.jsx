import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import NotificationToast from '../../../components/common/NotificationToast';
import './SchoolDashboard.css';

const SchoolDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showToast, setShowToast] = useState(false);
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
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [statsRes, donationsRes, needsRes, messagesRes] = await Promise.all([
        api.get('/school/stats', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/school/donations/recent', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/school/needs', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/school/messages/recent', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Auto-update need urgency based on age
      const needsWithAutoUrgency = needsRes.data.map(need => {
        const daysOld = (new Date() - new Date(need.createdAt)) / (1000 * 60 * 60 * 24);
        let urgency = need.urgency;
        if (daysOld > 30 && urgency !== 'high') urgency = 'high';
        else if (daysOld > 15 && urgency !== 'medium' && urgency !== 'high') urgency = 'medium';
        return { ...need, urgency, autoUpdated: daysOld > 30 };
      });

      setDashboardData({
        stats: statsRes.data,
        recentDonations: donationsRes.data,
        pendingNeeds: needsWithAutoUrgency.filter(n => n.status === 'pending'),
        recentMessages: messagesRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/school/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      if (response.data.filter(n => !n.read).length > 0) {
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification read:', error);
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

  const getUrgencyBadge = (urgency, autoUpdated) => {
    switch(urgency) {
      case 'high': 
        return <span className="urgency-high">🔴 High Priority {autoUpdated && <span className="auto-badge">(Auto)</span>}</span>;
      case 'medium': 
        return <span className="urgency-medium">🟡 Medium Priority</span>;
      case 'low': 
        return <span className="urgency-low">🟢 Low Priority</span>;
      default: 
        return <span className="urgency-medium">🟡 Medium</span>;
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

  // Calculate progress percentage for a need
  const getProgressPercentage = (need) => {
    if (!need.quantity) return 0;
    return (need.fulfilled / need.quantity) * 100;
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
          <button className="icon-btn" onClick={() => navigate('/school/notifications')}>
            <span>🔔</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="badge">{notifications.filter(n => !n.read).length}</span>
            )}
          </button>
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
        <button className="action-btn primary" onClick={() => navigate('/school/needs')}>
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
        <button className="action-btn" onClick={() => navigate('/school/analytics')}>
          <span>📊</span> View Analytics
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

        {/* Pending Needs with Progress Bar */}
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
                <div key={need._id || need.id} className="need-item">
                  <div className="need-info">
                    <h3>{need.item}</h3>
                    <p className="need-quantity">Required: {need.quantity} | Received: {need.fulfilled || 0}</p>
                    {getUrgencyBadge(need.urgency, need.autoUpdated)}
                    
                    {/* Progress Bar */}
                    <div className="progress-bar-container">
                      <div 
                        className="progress-fill-need"
                        style={{ width: `${getProgressPercentage(need)}%` }}
                      >
                        <span className="progress-text">{Math.round(getProgressPercentage(need))}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="need-status">
                    <span className="status-pending">Pending</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No pending needs.</p>
                <button className="add-need-btn" onClick={() => navigate('/school/needs')}>
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
                    <span>{message.senderName?.charAt(0) || 'D'}</span>
                  </div>
                  <div className="message-info">
                    <h4>{message.senderName || 'Donor'}</h4>
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

      {/* Notification Toast */}
      {showToast && (
        <NotificationToast 
          notifications={notifications.filter(n => !n.read)}
          onClose={() => setShowToast(false)}
          onMarkRead={handleMarkNotificationRead}
        />
      )}
    </div>
  );
};

export default SchoolDashboard;