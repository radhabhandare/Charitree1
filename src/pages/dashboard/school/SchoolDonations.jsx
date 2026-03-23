import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolDonations.css';

const SchoolDonations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/school/donations', {
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredDonations = donations.filter(donation => {
    if (filter !== 'all' && donation.status !== filter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="school-loading">
        <div className="loading-spinner"></div>
        <p>Loading donations...</p>
      </div>
    );
  }

  return (
    <div className="school-donations-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/school/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Received Donations</h1>
      </div>

      <div className="filter-tabs">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        <button className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`} onClick={() => setFilter('shipped')}>In Transit</button>
        <button className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>Delivered</button>
      </div>

      {donations.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>No Donations Yet</h3>
          <p>Donations will appear here once donors contribute.</p>
        </div>
      ) : (
        <div className="donations-grid">
          {filteredDonations.map(donation => (
            <div key={donation.id} className="donation-card">
              <div className="donation-header">
                <div>
                  <h3>{donation.donorName || 'Anonymous Donor'}</h3>
                  <p className="donor-email">{donation.donorEmail}</p>
                </div>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(donation.status) }}
                >
                  {getStatusIcon(donation.status)} {donation.status}
                </span>
              </div>
              
              <div className="donation-body">
                <div className="items-list">
                  <strong>Items Received:</strong>
                  <ul>
                    {donation.items?.map((item, idx) => (
                      <li key={idx}>{item.name || item} x{item.quantity || 1}</li>
                    ))}
                  </ul>
                </div>
                <div className="donation-meta">
                  <p><strong>Date:</strong> {formatDate(donation.date)}</p>
                  {donation.trackingNumber && (
                    <p><strong>Tracking #:</strong> {donation.trackingNumber}</p>
                  )}
                  {donation.estimatedDelivery && (
                    <p><strong>Est. Delivery:</strong> {formatDate(donation.estimatedDelivery)}</p>
                  )}
                </div>
              </div>
              
              <div className="donation-footer">
                <button 
                  className="track-btn"
                  onClick={() => navigate(`/school/tracking/${donation.id}`)}
                >
                  Track Donation
                </button>
                <button 
                  className="message-btn"
                  onClick={() => navigate(`/school/messages/${donation.donorId}`)}
                >
                  Message Donor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolDonations;