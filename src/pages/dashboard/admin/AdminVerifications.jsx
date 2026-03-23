import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './AdminVerifications.css';

const AdminVerifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingSchools, setPendingSchools] = useState([]);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/verifications');
      console.log('📋 Verifications response:', response.data);
      
      // Make sure we're setting the data correctly
      setPendingSchools(response.data.pendingSchools || []);
      setPendingCampaigns(response.data.pendingCampaigns || []);
      
      console.log('🏫 Pending schools count:', response.data.pendingSchools?.length || 0);
      console.log('📢 Pending campaigns count:', response.data.pendingCampaigns?.length || 0);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setPendingSchools([]);
      setPendingCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (schoolId, status) => {
    try {
      if (status === 'rejected' && !rejectionReason) {
        setSelectedSchool(schoolId);
        setShowRejectModal(true);
        return;
      }
      
      console.log('✅ Verifying school:', { schoolId, status, reason: rejectionReason });
      
      await api.put(`/admin/verify-school/${schoolId}`, { 
        status,
        reason: rejectionReason 
      });
      
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedSchool(null);
      
      // Refresh the list
      await fetchPendingVerifications();
      
      // Show success message
      alert(`School ${status === 'verified' ? 'approved' : 'rejected'} successfully!`);
      
    } catch (error) {
      console.error('Error verifying school:', error);
      alert('Failed to verify school. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pending verifications...</p>
      </div>
    );
  }

  // Show message if no pending schools
  if (pendingSchools.length === 0 && pendingCampaigns.length === 0) {
    return (
      <div className="admin-verifications">
        <div className="verifications-header">
          <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>School Verifications</h1>
        </div>
        <div className="empty-state">
          <span className="empty-icon">✅</span>
          <h3>No Pending Verifications</h3>
          <p>All schools and campaigns have been verified.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-verifications">
      <div className="verifications-header">
        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>School Verifications</h1>
        <span className="pending-count">{pendingSchools.length} pending</span>
      </div>

      {/* Pending Schools */}
      {pendingSchools.length > 0 && (
        <div className="verifications-section">
          <h2>Schools Awaiting Verification ({pendingSchools.length})</h2>
          <div className="verifications-grid">
            {pendingSchools.map(school => (
              <div key={school._id} className="verification-card">
                <div className="card-header">
                  <h2>{school.schoolName}</h2>
                  <span className="pending-badge">Pending</span>
                </div>
                
                <div className="school-details">
                  <div className="detail-row">
                    <label>School Type:</label>
                    <span className="capitalize">{school.schoolType}</span>
                  </div>
                  <div className="detail-row">
                    <label>Principal:</label>
                    <span>{school.principalName}</span>
                  </div>
                  <div className="detail-row">
                    <label>Phone:</label>
                    <span>{school.phoneNumber}</span>
                  </div>
                  <div className="detail-row">
                    <label>Email:</label>
                    <span>{school.userId?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Address:</label>
                    <span>
                      {school.address?.street}, {school.address?.city}, {school.address?.state} - {school.address?.pincode}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Students:</label>
                    <span>{school.studentCount}</span>
                  </div>
                  <div className="detail-row">
                    <label>Teachers:</label>
                    <span>{school.teacherCount}</span>
                  </div>
                  <div className="detail-row">
                    <label>Established:</label>
                    <span>{school.establishmentYear}</span>
                  </div>
                  <div className="detail-row">
                    <label>Registered:</label>
                    <span>{formatDate(school.createdAt)}</span>
                  </div>
                </div>

                {school.description && school.description !== '' && (
                  <div className="school-description">
                    <h3>Description</h3>
                    <p>{school.description}</p>
                  </div>
                )}

                {school.needs && school.needs.length > 0 && (
                  <div className="school-needs">
                    <h3>Needs</h3>
                    <div className="needs-list">
                      {school.needs.map((need, idx) => (
                        <span key={idx} className="need-tag">{need.item}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="action-buttons">
                  <button 
                    className="approve-btn"
                    onClick={() => handleVerify(school._id, 'verified')}
                  >
                    ✓ Approve School
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleVerify(school._id, 'rejected')}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Campaigns */}
      {pendingCampaigns.length > 0 && (
        <div className="verifications-section">
          <h2>Campaigns Awaiting Verification ({pendingCampaigns.length})</h2>
          <div className="verifications-grid">
            {pendingCampaigns.map(campaign => (
              <div key={campaign._id} className="verification-card">
                <div className="card-header">
                  <h2>{campaign.organizationName}</h2>
                  <span className="pending-badge">Pending</span>
                </div>
                <div className="school-details">
                  <div className="detail-row">
                    <label>Type:</label>
                    <span className="capitalize">{campaign.organizationType}</span>
                  </div>
                  <div className="detail-row">
                    <label>Contact:</label>
                    <span>{campaign.contactPerson}</span>
                  </div>
                  <div className="detail-row">
                    <label>Phone:</label>
                    <span>{campaign.phoneNumber}</span>
                  </div>
                  <div className="detail-row">
                    <label>Email:</label>
                    <span>{campaign.userId?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Address:</label>
                    <span>
                      {campaign.address?.street}, {campaign.address?.city}, {campaign.address?.state}
                    </span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button 
                    className="approve-btn"
                    onClick={() => handleVerify(campaign._id, 'verified')}
                  >
                    ✓ Approve Campaign
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleVerify(campaign._id, 'rejected')}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reject School</h3>
            <p>Please provide a reason for rejection:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows="4"
            />
            <div className="modal-actions">
              <button onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedSchool(null);
              }}>
                Cancel
              </button>
              <button onClick={() => handleVerify(selectedSchool, 'rejected')}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerifications;