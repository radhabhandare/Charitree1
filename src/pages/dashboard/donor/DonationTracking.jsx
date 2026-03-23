import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './DonationTracking.css';

const DonationTracking = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDonationDetails();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchDonationDetails, 30000);
    return () => clearInterval(interval);
  }, [donationId]);

  const fetchDonationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/donor/donations/${donationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonation(response.data);
    } catch (error) {
      console.error('Error fetching donation:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestUpdate = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(`/donor/donations/${donationId}/request-update`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Update requested. We will notify you when there is an update.');
    } catch (error) {
      console.error('Error requesting update:', error);
      alert('Failed to request update. Please try again.');
    } finally {
      setUpdating(false);
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

  if (loading) {
    return (
      <div className="donor-loading">
        <div className="loading-spinner"></div>
        <p>Loading tracking details...</p>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="donation-tracking">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="empty-state">Donation not found</div>
      </div>
    );
  }

  const stages = ['pending', 'accepted', 'processing', 'shipped', 'delivered'];
  const currentStageIndex = stages.indexOf(donation.status);

  return (
    <div className="donation-tracking">
      <div className="tracking-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Track Your Donation</h1>
        <button className="refresh-btn" onClick={fetchDonationDetails} disabled={loading}>⟳ Refresh</button>
      </div>

      <div className="tracking-card">
        <div className="donation-summary">
          <div className="school-info">
            <h2>{donation.schoolName}</h2>
            <p className="school-location">{donation.schoolLocation}</p>
          </div>
          <div className="donation-meta">
            <div className="meta-item"><span className="meta-label">Donation ID</span><span className="meta-value">{donation.id}</span></div>
            <div className="meta-item"><span className="meta-label">Date</span><span className="meta-value">{formatDateTime(donation.createdAt)}</span></div>
            <div className="meta-item"><span className="meta-label">Total Items</span><span className="meta-value">{donation.totalItems}</span></div>
            <div className="meta-item"><span className="meta-label">Status</span><span className="meta-value status">{donation.status.toUpperCase()}</span></div>
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
            <div className="info-item"><span className="info-label">Tracking Number</span><span className="info-value tracking-number">{donation.trackingNumber || 'Not assigned yet'}</span></div>
            <div className="info-item"><span className="info-label">Estimated Delivery</span><span className="info-value">{formatDateTime(donation.estimatedDelivery)}</span></div>
            {donation.actualDelivery && <div className="info-item"><span className="info-label">Delivered On</span><span className="info-value">{formatDateTime(donation.actualDelivery)}</span></div>}
            {donation.courier && <div className="info-item"><span className="info-label">Courier Partner</span><span className="info-value">{donation.courier}</span></div>}
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

        <div className="tracking-actions">
          <button className="message-school-btn" onClick={() => navigate(`/donor/messages/${donation.schoolId}`)}>💬 Message School</button>
          <button className="request-update-btn" onClick={requestUpdate} disabled={updating}>{updating ? 'Requesting...' : '📢 Request Update'}</button>
        </div>
      </div>
    </div>
  );
};

export default DonationTracking;