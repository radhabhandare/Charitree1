import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolDonations.css';

const SchoolDonations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleAcceptDonation = async (donationId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(`/school/donations/${donationId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Donation accepted successfully!');
      fetchDonations();
    } catch (error) {
      console.error('Error accepting donation:', error);
      alert('Failed to accept donation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to reject this donation?')) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(`/school/donations/${donationId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Donation rejected');
      fetchDonations();
    } catch (error) {
      console.error('Error rejecting donation:', error);
      alert('Failed to reject donation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReceived = async (donationId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(`/school/donations/${donationId}/received`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Donation marked as received! Thank you!');
      fetchDonations();
    } catch (error) {
      console.error('Error marking received:', error);
      alert('Failed to mark as received');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ff9800',
      'accepted': '#2196f3',
      'processing': '#9c27b0',
      'shipped': '#1976d2',
      'delivered': '#2e7d32',
      'rejected': '#d32f2f',
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
      'rejected': '❌',
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
        <button className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>Accepted</button>
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
                  <p className="donation-method">
                    {donation.donationMethod === 'ecommerce' ? '🛒 E-commerce' : 
                     donation.donationMethod === 'courier' ? '📦 Courier' : '🚗 Self Delivery'}
                  </p>
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
                  <strong>Items Donated:</strong>
                  <ul>
                    {donation.items?.map((item, idx) => (
                      <li key={idx}>{item.name} x{item.quantity}</li>
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
                  {donation.actualDelivery && (
                    <p><strong>Delivered:</strong> {formatDate(donation.actualDelivery)}</p>
                  )}
                  {donation.deliveryProof?.image && (
                    <p><strong>Delivery Proof:</strong> <a href={donation.deliveryProof.image} target="_blank" rel="noopener noreferrer">View Image</a></p>
                  )}
                </div>
              </div>
              
              <div className="donation-footer">
                {donation.status === 'pending' && (
                  <>
                    <button 
                      className="accept-btn"
                      onClick={() => handleAcceptDonation(donation.id)}
                      disabled={actionLoading}
                    >
                      ✓ Accept Donation
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleRejectDonation(donation.id)}
                      disabled={actionLoading}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                {donation.status === 'accepted' && (
                  <button 
                    className="track-btn"
                    onClick={() => navigate(`/school/tracking/${donation.id}`)}
                  >
                    Track Donation
                  </button>
                )}
                {donation.status === 'shipped' && (
                  <button 
                    className="received-btn"
                    onClick={() => handleMarkReceived(donation.id)}
                    disabled={actionLoading}
                  >
                    Mark as Received
                  </button>
                )}
                {(donation.status === 'delivered' || donation.status === 'rejected') && (
                  <button 
                    className="message-btn"
                    onClick={() => navigate(`/school/messages/${donation.donorId}`)}
                  >
                    Message Donor
                  </button>
                )}
                <button 
                  className="track-btn"
                  onClick={() => navigate(`/school/tracking/${donation.id}`)}
                >
                  View Details
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