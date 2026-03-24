import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './DonorCampaigns.css';

const DonorCampaigns = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/campaigns/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="donor-loading">
        <div className="loading-spinner"></div>
        <p>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="donor-campaigns">
      <div className="campaigns-header">
        <button className="back-btn" onClick={() => navigate('/donor/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Active Campaigns</h1>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📢</span>
          <h3>No Active Campaigns</h3>
          <p>Check back later for new campaigns.</p>
        </div>
      ) : (
        <div className="campaigns-grid">
          {campaigns.map(campaign => (
            <div key={campaign._id} className="campaign-card" onClick={() => navigate(`/donor/campaign/${campaign._id}`)}>
              <div className="campaign-image">
                {campaign.images?.[0] ? (
                  <img src={campaign.images[0]} alt={campaign.title} />
                ) : (
                  <div className="image-placeholder">📢</div>
                )}
                <div className="campaign-progress-badge">{Math.round(campaign.progress)}%</div>
              </div>
              <div className="campaign-content">
                <h3>{campaign.title}</h3>
                <p className="campaign-description">{campaign.description}</p>
                <div className="campaign-stats">
                  <span>🎯 Goal: {campaign.goal} items</span>
                  <span>❤️ {campaign.donors} donors</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${campaign.progress}%` }}></div>
                </div>
                <button className="support-btn">Support Campaign</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorCampaigns;