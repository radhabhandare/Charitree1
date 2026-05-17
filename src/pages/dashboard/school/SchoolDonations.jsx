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
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Demo Donation Data for ZPCPS WALANDI - Radha Bhandare (Self Delivery)
  const demoDonation = {
    id: 'DEMO-001',
    donorName: 'Radha Bhandare',
    donorEmail: 'radhabhandare2004@gmail.com',
    donorPhone: '+91 8625948481',
    schoolName: 'ZPCPS WALANDI',
    schoolEmail: 'zpschool@gmail.com',
    schoolAddress: 'Walandi Village, Taluka - Miraj, District - Sangli, Maharashtra 416410',
    donationMethod: 'self-delivery',
    status: 'delivered',
    registrationDate: '2025-04-04T09:30:00',
    deliveryDate: '2025-04-05T14:15:00',
    items: [
      { name: '10th Science - Physics Textbook', quantity: 5, stream: 'Science', standard: '10th' },
      { name: '10th Science - Chemistry Textbook', quantity: 5, stream: 'Science', standard: '10th' },
      { name: '10th Science - Biology Textbook', quantity: 5, stream: 'Science', standard: '10th' },
      { name: '10th Science - Mathematics Textbook', quantity: 5, stream: 'Science', standard: '10th' },
      { name: '11th Science - Physics Textbook', quantity: 5, stream: 'Science', standard: '11th' }
    ],
    totalItems: 25,
    deliveryPerson: {
      name: 'Radha Bhandare',
      contact: '+91 8625948481',
      vehicleNumber: 'MH-09-AB-1234'
    },
    deliveryTimeline: {
      registered: '2025-04-04T09:30:00',
      picked: '2025-04-04T11:00:00',
      inTransit: '2025-04-04T14:30:00',
      outForDelivery: '2025-04-05T10:00:00',
      delivered: '2025-04-05T14:15:00'
    },
    deliveryProof: {
      receivedBy: 'Mr. Patil (School Administrator)',
      signature: 'Digital Signature Verified',
      photo: 'https://via.placeholder.com/400x300?text=Self+Delivery+ZPCPS+WALANDI'
    },
    message: "Thank you Radha for personally delivering these 25 books to our students!"
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/schools/donations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allDonations = [demoDonation, ...response.data];
      setDonations(allDonations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([demoDonation]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDonation = async (donationId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(`/schools/donations/${donationId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Donation accepted successfully!');
      fetchDonations();
    } catch (error) {
      console.error('Error accepting donation:', error);
      alert('Failed to accept donation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReceived = async (donationId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(`/schools/donations/${donationId}/received`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('🎉 Donation marked as received! Thank you Radha Bhandare for your generous contribution of 25 books!');
      fetchDonations();
    } catch (error) {
      console.error('Error marking received:', error);
      alert('Failed to mark as received');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDeliveryDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDeliveryModal(true);
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

  const getDeliveryMethodIcon = (method) => {
    switch(method) {
      case 'self-delivery': return '🚗 Self Delivery';
      case 'courier': return '📦 Courier';
      case 'ecommerce': return '🛒 E-commerce';
      default: return '📋 Other';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalQuantity = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
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

      {/* Demo Donation Highlight */}
      <div className="demo-highlight">
        <div className="demo-badge">🌟 Featured Donation - Self Delivery</div>
        <p>Special thanks to <strong>Radha Bhandare</strong> for personally delivering <strong>25 books</strong> to ZPCPS WALANDI on <strong>April 5, 2026</strong>!</p>
      </div>

      <div className="filter-tabs">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        <button className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>Accepted</button>
        <button className={`filter-btn ${filter === 'processing' ? 'active' : ''}`} onClick={() => setFilter('processing')}>Processing</button>
        <button className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>Delivered</button>
      </div>

      {filteredDonations.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>No Donations Yet</h3>
          <p>Donations will appear here once donors contribute.</p>
        </div>
      ) : (
        <div className="donations-grid">
          {filteredDonations.map(donation => (
            <div key={donation.id} className={`donation-card ${donation.id === 'DEMO-001' ? 'demo-card' : ''}`}>
              {donation.id === 'DEMO-001' && <div className="featured-ribbon">⭐ Featured</div>}
              
              <div className="donation-header">
                <div>
                  <h3>{donation.donorName || 'Anonymous Donor'}</h3>
                  <p className="donor-email">{donation.donorEmail}</p>
                  <p className="donor-phone">📞 {donation.donorPhone}</p>
                  <p className="donation-method">
                    {getDeliveryMethodIcon(donation.donationMethod)}
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
                <div className="items-summary">
                  <strong>📚 Total Books Donated:</strong> {getTotalQuantity(donation.items)} books
                </div>
                
                <div className="items-list">
                  <strong>Books List:</strong>
                  <div className="items-grid">
                    {donation.items?.map((item, idx) => (
                      <div key={idx} className="item-tag">
                        📖 {item.name} 
                        <span className="quantity-badge">x{item.quantity}</span>
                        {item.standard && <span className="std-badge">{item.standard}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="donation-meta">
                  <p><strong>📅 Registration Date:</strong> {formatDateTime(donation.registrationDate)}</p>
                  {donation.deliveryDate && (
                    <p><strong>🎉 Delivery Date:</strong> {formatDateTime(donation.deliveryDate)}</p>
                  )}
                  {donation.donationMethod === 'self-delivery' && donation.deliveryPerson && (
                    <div className="delivery-info">
                      <p><strong>🚗 Delivery Person:</strong> {donation.deliveryPerson.name}</p>
                      <p><strong>📞 Contact:</strong> {donation.deliveryPerson.contact}</p>
                      
                    </div>
                  )}
                </div>
              </div>
              
              <div className="donation-footer">
                {donation.status === 'pending' && (
                  <button 
                    className="accept-btn"
                    onClick={() => handleAcceptDonation(donation.id)}
                    disabled={actionLoading}
                  >
                    ✓ Accept Donation
                  </button>
                )}
                {donation.status === 'processing' && (
                  <button 
                    className="received-btn"
                    onClick={() => handleMarkReceived(donation.id)}
                    disabled={actionLoading}
                  >
                    📦 Mark as Received
                  </button>
                )}
                <button 
                  className="track-btn"
                  onClick={() => handleViewDeliveryDetails(donation)}
                >
                  🚚 View Delivery Details
                </button>
                <button 
                  className="message-btn"
                  onClick={() => navigate(`/school/messages/${donation.donorEmail}`)}
                >
                  💬 Message Donor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Details Modal */}
      {showDeliveryModal && selectedDonation && (
        <div className="modal-overlay" onClick={() => setShowDeliveryModal(false)}>
          <div className="delivery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚚 Delivery Details</h2>
              <button className="close-modal" onClick={() => setShowDeliveryModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="delivery-summary">
                <h3>Donor: {selectedDonation.donorName}</h3>
                <p>📧 {selectedDonation.donorEmail}</p>
                <p>📞 {selectedDonation.donorPhone}</p>
              </div>
              
              <div className="delivery-timeline">
                <h3>📅 Delivery Timeline</h3>
                <div className="timeline-steps">
                  <div className="timeline-step completed">
                    <div className="step-icon">✅</div>
                    <div className="step-content">
                      <strong>April 4, 2026 - 9:30 AM</strong>
                      <p>Donation Registered on Charitree Platform</p>
                    </div>
                  </div>
                  
                  <div className="timeline-step completed">
                    <div className="step-icon">🔄</div>
                    <div className="step-content">
                      <strong>April 4, 2026 - 11:00 AM</strong>
                      <p>Donor confirmed self-delivery arrangement</p>
                    </div>
                  </div>
                  
                  <div className="timeline-step completed">
                    <div className="step-icon">🚗</div>
                    <div className="step-content">
                      <strong>April 4, 2026 - 2:30 PM</strong>
                      <p>Donor departed with 25 books for ZPCPS WALANDI</p>
                    </div>
                  </div>
                  
                  <div className="timeline-step completed">
                    <div className="step-icon">📍</div>
                    <div className="step-content">
                      <strong>April 5, 2026 - 10:00 AM</strong>
                      <p>Donor arrived at Walandi</p>
                    </div>
                  </div>
                  
                  <div className="timeline-step completed">
                    <div className="step-icon">🎉</div>
                    <div className="step-content">
                      <strong>April 5, 2026 - 2:15 PM</strong>
                      <p>Successfully delivered to ZPCPS WALANDI School</p>
                      <p className="received-by">Received by: Mr. Patil (School Administrator)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="delivery-items">
                <h3>📚 Books Delivered (25 Total)</h3>
                <ul>
                  {selectedDonation.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} - {item.quantity} copies
                      {item.standard && <span className="std-tag">{item.standard} Standard</span>}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="delivery-proof">
                <h3>✅ Delivery Confirmation</h3>
                <p><strong>Received By:</strong> {selectedDonation.deliveryProof?.receivedBy}</p>
                <p><strong>Signature:</strong> {selectedDonation.deliveryProof?.signature}</p>
                <p><strong>Status:</strong> <span className="success-text">Successfully Delivered</span></p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="confirm-btn" onClick={() => setShowDeliveryModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDonations;