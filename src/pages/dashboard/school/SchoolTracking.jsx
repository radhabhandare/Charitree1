import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolTracking.css';

const SchoolTracking = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);

  useEffect(() => {
    fetchDonationDetails();
  }, [donationId]);

  const fetchDonationDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/school/donations/${donationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonation(response.data);
    } catch (error) {
      console.error('Error fetching donation:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const getStageIcon = (stage) => {
    const icons = {
      'pending': '📝',
      'accepted': '✅',
      'processing': '📦',
      'shipped': '🚚',
      'delivered': '🎉',
      'cancelled': '❌'
    };
    return icons[stage] || '📋';
  };

  const updateStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/school/donations/${donationId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDonationDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="school-loading">
        <div className="loading-spinner"></div>
        <p>Loading tracking details...</p>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="school-tracking-page">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="empty-state">Donation not found</div>
      </div>
    );
  }

  const stages = ['pending', 'accepted', 'processing', 'shipped', 'delivered'];
  const currentStageIndex = stages.indexOf(donation.status);

  return (
    <div className="school-tracking-page">
      <div className="tracking-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Track Incoming Donation</h1>
      </div>

      <div className="tracking-card">
        <div className="donation-summary">
          <div className="donor-info">
            <h2>{donation.donorName || 'Anonymous Donor'}</h2>
            <p className="donor-email">{donation.donorEmail}</p>
          </div>
          <div className="donation-meta">
            <div><label>Donation ID</label><span>{donation.id}</span></div>
            <div><label>Date</label><span>{formatDateTime(donation.date)}</span></div>
            <div><label>Items</label><span>{donation.items?.length}</span></div>
            <div><label>Status</label><span className="status">{donation.status}</span></div>
          </div>
        </div>

        <div className="tracking-timeline">
          <h3>Delivery Timeline</h3>
          <div className="timeline-progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(currentStageIndex + 1) / stages.length * 100}%` }}></div>
            </div>
            <div className="timeline-stages">
              {stages.map((stage, index) => (
                <div key={stage} className={`timeline-stage ${index <= currentStageIndex ? 'completed' : ''} ${index === currentStageIndex ? 'current' : ''}`}>
                  <div className="stage-icon">{getStageIcon(stage)}</div>
                  <span className="stage-name">{stage}</span>
                  {donation.timeline?.[stage] && <span className="stage-date">{formatDateTime(donation.timeline[stage])}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="delivery-info">
          <h3>Delivery Information</h3>
          <div className="info-grid">
            <div><label>Tracking Number</label><span>{donation.trackingNumber || 'Not assigned'}</span></div>
            <div><label>Estimated Delivery</label><span>{formatDateTime(donation.estimatedDelivery)}</span></div>
            {donation.actualDelivery && <div><label>Delivered On</label><span>{formatDateTime(donation.actualDelivery)}</span></div>}
          </div>
        </div>

        <div className="items-list">
          <h3>Items in this Donation</h3>
          <table className="items-table">
            <thead><tr><th>Item</th><th>Quantity</th></tr></thead>
            <tbody>
              {donation.items?.map((item, idx) => (
                <tr key={idx}><td>{item.name}</td><td>{item.quantity}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="status-update">
          <h3>Update Status</h3>
          <div className="status-buttons">
            {donation.status === 'pending' && (
              <button className="accept-btn" onClick={() => updateStatus('accepted')}>✓ Accept Donation</button>
            )}
            {donation.status === 'accepted' && (
              <button className="processing-btn" onClick={() => updateStatus('processing')}>📦 Mark as Processing</button>
            )}
            {donation.status === 'processing' && (
              <button className="receive-btn" onClick={() => updateStatus('delivered')}>🎉 Mark as Received</button>
            )}
          </div>
        </div>

        <div className="tracking-actions">
          <button className="message-btn" onClick={() => navigate(`/school/messages/${donation.donorId}`)}>
            💬 Message Donor
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolTracking;