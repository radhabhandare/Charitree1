import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './DonorDashboard.css';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalItems: 0,
    schoolsSupported: 0,
    impactScore: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [verifiedSchools, setVerifiedSchools] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('donationCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [statsRes, donationsRes, schoolsRes, messagesRes, campaignsRes] = await Promise.all([
        api.get('/donor/dashboard-stats', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/donor/donations/recent', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/schools/verified', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/donor/messages/recent', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/campaigns/active', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setRecentDonations(donationsRes.data);
      setVerifiedSchools(schoolsRes.data || []);
      setRecentMessages(messagesRes.data);
      setCampaigns(campaignsRes.data || []);
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
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Welcome back, {user?.profile?.fullName || 'Donor'}!</h1>
          <p className="donor-email">{user?.email}</p>
          <div className="donor-badge">
            <span className="badge-icon">⭐</span>
            <span>Impact Score: {stats.impactScore}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={() => navigate('/donor/messages')}>
            {recentMessages.filter(m => !m.read).length > 0 && (
              <span className="notification-badge">{recentMessages.filter(m => !m.read).length}</span>
            )}
            <span>💬</span>
          </button>
          <button className="icon-btn" onClick={() => navigate('/donor/profile')}>
            <span>👤</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/donor/history')}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Donations</h3>
            <p className="stat-value">{stats.totalDonations}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/donor/tracking')}>
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>Active Donations</h3>
            <p className="stat-value">{stats.activeDonations}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/donor/history')}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-value">{stats.completedDonations}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/donor/impact')}>
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>Schools Supported</h3>
            <p className="stat-value">{stats.schoolsSupported}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn primary" onClick={() => navigate('/donor/browse')}>
          <span>🔍</span> Explore Schools
        </button>
        <button className="action-btn" onClick={() => navigate('/donor/campaigns')}>
          <span>📢</span> Campaigns
        </button>
        <button className="action-btn" onClick={() => navigate('/donor/history')}>
          <span>📋</span> Donation History
        </button>
        <button className="action-btn" onClick={() => navigate('/donor/impact')}>
          <span>📊</span> My Impact
        </button>
        {cartItems.length > 0 && (
          <button className="action-btn cart" onClick={() => navigate('/donor/cart')}>
            <span>🛒</span> Cart ({cartItems.length})
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Verified Schools */}
        <div className="dashboard-card schools-section">
          <div className="card-header">
            <h2>🎓 Verified Schools</h2>
            <button className="view-all" onClick={() => navigate('/donor/browse')}>View All →</button>
          </div>
          <div className="schools-list">
            {verifiedSchools.length > 0 ? (
              verifiedSchools.slice(0, 4).map(school => (
                <div key={school._id} className="school-item" onClick={() => navigate(`/school/${school._id}`)}>
                  <div className="school-image-placeholder">
                    <span>🏫</span>
                  </div>
                  <div className="school-info">
                    <h3>{school.schoolName}</h3>
                    <p className="school-location">{school.address?.city}, {school.address?.state}</p>
                    <p className="school-students">👥 {school.studentCount || 0} students</p>
                    <div className="school-needs-preview">
                      {school.needs?.slice(0, 2).map((need, idx) => (
                        <span key={idx} className="need-tag">{need.item}</span>
                      ))}
                    </div>
                    <button className="donate-btn-small" onClick={(e) => { e.stopPropagation(); navigate(`/school/${school._id}`); }}>
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No verified schools available yet.</p>
                <p>Check back later!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="dashboard-card donations-section">
          <div className="card-header">
            <h2>📦 Recent Donations</h2>
            <button className="view-all" onClick={() => navigate('/donor/history')}>View All →</button>
          </div>
          <div className="donations-list">
            {recentDonations.length > 0 ? (
              recentDonations.map(donation => (
                <div key={donation.id} className="donation-item" onClick={() => navigate(`/donor/tracking/${donation.id}`)}>
                  <div className="donation-info">
                    <h3>{donation.schoolName}</h3>
                    <p className="donation-method">
                      {donation.donationMethod === 'ecommerce' ? '🛒 E-commerce' : 
                       donation.donationMethod === 'courier' ? '📦 Courier' : '🚗 Self Delivery'}
                    </p>
                    <div className="donation-items-preview">
                      {donation.items?.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="item-tag">{item.name} x{item.quantity}</span>
                      ))}
                    </div>
                    <span className="donation-date">{formatDate(donation.createdAt)}</span>
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
                <p>No donations yet.</p>
                <button className="browse-btn" onClick={() => navigate('/donor/browse')}>Start Donating →</button>
              </div>
            )}
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="dashboard-card campaigns-section full-width">
          <div className="card-header">
            <h2>📢 Active Campaigns</h2>
            <button className="view-all" onClick={() => navigate('/donor/campaigns')}>View All →</button>
          </div>
          <div className="campaigns-list">
            {campaigns.length > 0 ? (
              campaigns.slice(0, 3).map(campaign => (
                <div key={campaign._id} className="campaign-item">
                  <div className="campaign-info">
                    <h3>{campaign.title}</h3>
                    <p className="campaign-description">{campaign.description}</p>
                    <div className="campaign-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${campaign.progress}%` }}></div>
                      </div>
                      <span className="progress-text">{Math.round(campaign.progress)}% funded</span>
                    </div>
                    <div className="campaign-meta">
                      <span>🎯 Goal: {campaign.goal} items</span>
                      <span>❤️ {campaign.donors} donors</span>
                    </div>
                  </div>
                  <button className="donate-btn" onClick={() => navigate(`/donor/campaign/${campaign._id}`)}>
                    Support Campaign
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No active campaigns at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;