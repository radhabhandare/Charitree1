import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './CampaignDetails.css';

const CampaignDetails = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaign(response.data);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || donationAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setDonating(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(`/campaigns/${campaignId}/donate`, {
        amount: donationAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Donation successful! Thank you for your support.');
      fetchCampaignDetails();
      setDonationAmount('');
    } catch (error) {
      console.error('Error donating:', error);
      alert('Failed to donate. Please try again.');
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="donor-loading">
        <div className="loading-spinner"></div>
        <p>Loading campaign details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="campaign-details">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="empty-state">Campaign not found</div>
      </div>
    );
  }

  return (
    <div className="campaign-details">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Campaigns</button>
        <h1>{campaign.title}</h1>
      </div>

      <div className="campaign-details-card">
        <div className="campaign-hero">
          {campaign.images?.[0] ? (
            <img src={campaign.images[0]} alt={campaign.title} className="campaign-hero-image" />
          ) : (
            <div className="hero-placeholder">📢</div>
          )}
        </div>

        <div className="campaign-info">
          <div className="campaign-progress-section">
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-label">Raised</span>
                <span className="stat-value">{campaign.donated || 0} items</span>
              </div>
              <div className="stat">
                <span className="stat-label">Goal</span>
                <span className="stat-value">{campaign.goal} items</span>
              </div>
              <div className="stat">
                <span className="stat-label">Donors</span>
                <span className="stat-value">{campaign.donors || 0}</span>
              </div>
            </div>
            <div className="progress-bar-large">
              <div className="progress-fill" style={{ width: `${campaign.progress}%` }}></div>
            </div>
            <p className="progress-percentage">{Math.round(campaign.progress)}% funded</p>
          </div>

          <div className="campaign-description">
            <h3>About This Campaign</h3>
            <p>{campaign.description}</p>
          </div>

          {campaign.story && (
            <div className="campaign-story">
              <h3>The Story</h3>
              <p>{campaign.story}</p>
            </div>
          )}

          <div className="donation-section">
            <h3>Support This Campaign</h3>
            <div className="donation-input">
              <input
                type="number"
                placeholder="Enter amount in items"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                min="1"
              />
              <button onClick={handleDonate} disabled={donating}>
                {donating ? 'Processing...' : 'Donate Now'}
              </button>
            </div>
          </div>

          {campaign.topDonors && campaign.topDonors.length > 0 && (
            <div className="top-donors">
              <h3>Top Donors</h3>
              <div className="donors-list">
                {campaign.topDonors.map((donor, idx) => (
                  <div key={idx} className="donor-item">
                    <span className="donor-rank">#{idx + 1}</span>
                    <span className="donor-name">{donor.donorName}</span>
                    <span className="donor-amount">{donor.total} items</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {campaign.recentDonations && campaign.recentDonations.length > 0 && (
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {campaign.recentDonations.map((donation, idx) => (
                  <div key={idx} className="activity-item">
                    <span className="activity-icon">🎉</span>
                    <span className="activity-text">
                      {donation.donorId?.email?.split('@')[0] || 'Someone'} donated {donation.totalItems} items
                    </span>
                    <span className="activity-time">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;