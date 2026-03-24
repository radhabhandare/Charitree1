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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    trackingId: '',
    courierName: '',
    proofImage: '',
    notes: ''
  });

  useEffect(() => {
    fetchDonationDetails();
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

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(`/donor/donations/${donationId}/status`, {
        status: updateData.status,
        trackingDetails: {
          trackingId: updateData.trackingId,
          courierName: updateData.courierName
        },
        deliveryProof: {
          image: updateData.proofImage,
          notes: updateData.notes
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Status updated successfully!');
      setShowUpdateModal(false);
      fetchDonationDetails();
      setUpdateData({ status: '', trackingId: '', courierName: '', proofImage: '', notes: '' });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const requestUpdate = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(`/donor/donations/${donationId}/request-update`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Update requested. The school will be notified.');
    } catch (error) {
      console.error('Error requesting update:', error);
      alert('Failed to request update');
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
      'rejected': '❌',
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
            <div className="meta-item">
              <span className="meta-label">Donation ID</span>
              <span className="meta-value">{donation.id}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Date</span>
              <span className="meta-value">{formatDateTime(donation.createdAt)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Total Items</span>
              <span className="meta-value">{donation.totalItems}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Status</span>
              <span className="meta-value status">{donation.status.toUpperCase()}</span>
            </div>
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
            <div className="info-item">
              <span className="info-label">Tracking Number</span>
              <span className="info-value tracking-number">{donation.trackingNumber || 'Not assigned yet'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Courier Partner</span>
              <span className="info-value">{donation.courier || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Estimated Delivery</span>
              <span className="info-value">{formatDateTime(donation.estimatedDelivery)}</span>
            </div>
            {donation.actualDelivery && (
              <div className="info-item">
                <span className="info-label">Delivered On</span>
                <span className="info-value">{formatDateTime(donation.actualDelivery)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="items-list">
          <h3>Items in this Donation</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {donation.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tracking-actions">
          {donation.status === 'pending' && (
            <button className="request-update-btn" onClick={requestUpdate} disabled={updating}>
              📢 Request Update from School
            </button>
          )}
          {donation.status === 'accepted' && (
            <button className="update-status-btn" onClick={() => setShowUpdateModal(true)}>
              📦 Update Delivery Status
            </button>
          )}
          <button className="message-school-btn" onClick={() => navigate(`/donor/messages/${donation.schoolId}`)}>
            💬 Message School
          </button>
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Delivery Status</h3>
            <div className="form-group">
              <label>Status</label>
              <select value={updateData.status} onChange={(e) => setUpdateData({...updateData, status: e.target.value})}>
                <option value="">Select status</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            {(updateData.status === 'shipped' || updateData.status === 'processing') && (
              <>
                <div className="form-group">
                  <label>Courier Name</label>
                  <input 
                    type="text" 
                    value={updateData.courierName} 
                    onChange={(e) => setUpdateData({...updateData, courierName: e.target.value})} 
                    placeholder="e.g., DTDC, BlueDart" 
                  />
                </div>
                <div className="form-group">
                  <label>Tracking ID</label>
                  <input 
                    type="text" 
                    value={updateData.trackingId} 
                    onChange={(e) => setUpdateData({...updateData, trackingId: e.target.value})} 
                    placeholder="Enter tracking number" 
                  />
                </div>
              </>
            )}
            {updateData.status === 'delivered' && (
              <>
                <div className="form-group">
                  <label>Delivery Proof (Image URL)</label>
                  <input 
                    type="text" 
                    value={updateData.proofImage} 
                    onChange={(e) => setUpdateData({...updateData, proofImage: e.target.value})} 
                    placeholder="Paste image URL or upload" 
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    value={updateData.notes} 
                    onChange={(e) => setUpdateData({...updateData, notes: e.target.value})} 
                    rows="3" 
                    placeholder="Any additional notes..." 
                  />
                </div>
              </>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowUpdateModal(false)}>Cancel</button>
              <button onClick={handleUpdateStatus} disabled={updating}>
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationTracking;