import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './DonationHistory.css';

const DonationHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/donor/donations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonations(response.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
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

  const filteredDonations = donations.filter(donation => {
    if (filter !== 'all' && donation.status !== filter) return false;
    if (searchTerm && !donation.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="donor-loading">
        <div className="loading-spinner"></div>
        <p>Loading donation history...</p>
      </div>
    );
  }

  return (
    <div className="donation-history">
      <div className="history-header">
        <h1>My Donation History</h1>
        <button className="back-btn" onClick={() => navigate('/donor/dashboard')}>← Back to Dashboard</button>
      </div>

      <div className="history-filters">
        <div className="search-box">
          <input type="text" placeholder="Search by school name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-tabs">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>Delivered</button>
          <button className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`} onClick={() => setFilter('shipped')}>In Transit</button>
          <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        </div>
      </div>

      {filteredDonations.length === 0 ? (
        <div className="empty-state">
          <p>No donations found.</p>
          <button className="browse-btn" onClick={() => navigate('/donor/browse')}>Browse Schools →</button>
        </div>
      ) : (
        <div className="donations-grid">
          {filteredDonations.map(donation => (
            <div key={donation.id} className="donation-card" onClick={() => navigate(`/donor/tracking/${donation.id}`)}>
              <div className="donation-card-header">
                <div>
                  <h2>{donation.schoolName}</h2>
                  <p className="school-location">{donation.schoolLocation}</p>
                </div>
                <span className="status-badge large" style={{ backgroundColor: getStatusColor(donation.status) }}>
                  {getStatusIcon(donation.status)} {donation.status.toUpperCase()}
                </span>
              </div>

              <div className="donation-items-list">
                <h3>Items Donated</h3>
                {donation.items?.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="donation-details">
                <div className="detail-row">
                  <span className="detail-label">Donation ID:</span>
                  <span className="detail-value">{donation.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(donation.createdAt)}</span>
                </div>
                {donation.trackingNumber && (
                  <div className="detail-row">
                    <span className="detail-label">Tracking #:</span>
                    <span className="detail-value tracking-number">{donation.trackingNumber}</span>
                  </div>
                )}
              </div>

              <div className="tracking-timeline-preview">
                <div className="timeline-stages">
                  {['pending', 'accepted', 'processing', 'shipped', 'delivered'].map((stage, idx) => {
                    const stageIndex = ['pending', 'accepted', 'processing', 'shipped', 'delivered'].indexOf(stage);
                    const currentIndex = ['pending', 'accepted', 'processing', 'shipped', 'delivered'].indexOf(donation.status);
                    const isCompleted = stageIndex <= currentIndex;
                    const isCurrent = stage === donation.status;
                    return (
                      <div key={stage} className="timeline-stage">
                        <div className={`stage-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                          {isCompleted && '✓'}
                        </div>
                        <span className="stage-name">{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="donation-card-footer">
                <button className="track-btn" onClick={(e) => { e.stopPropagation(); navigate(`/donor/tracking/${donation.id}`); }}>Track Donation</button>
                <button className="message-btn" onClick={(e) => { e.stopPropagation(); navigate(`/donor/messages/${donation.schoolId}`); }}>Message School</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationHistory;