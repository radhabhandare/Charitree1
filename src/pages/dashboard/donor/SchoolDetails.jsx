import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolDetails.css';

const SchoolDetails = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [donating, setDonating] = useState(false);
  const [selectedNeeds, setSelectedNeeds] = useState([]);

  useEffect(() => {
    fetchSchoolDetails();
  }, [schoolId]);

  const fetchSchoolDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/schools/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchool(response.data);
    } catch (error) {
      console.error('Error fetching school details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (selectedNeeds.length === 0) {
      alert('Please select items to donate');
      return;
    }
    
    setDonating(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/donations', {
        schoolId: school.id,
        items: selectedNeeds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Donation initiated successfully!');
      navigate('/donor/history');
    } catch (error) {
      console.error('Error making donation:', error);
      alert('Failed to initiate donation. Please try again.');
    } finally {
      setDonating(false);
    }
  };

  const toggleNeedSelection = (need) => {
    setSelectedNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need)
        : [...prev, need]
    );
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return '#d32f2f';
      case 'medium': return '#f57c00';
      case 'low': return '#2e7d32';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <div className="donor-loading">
        <div className="loading-spinner"></div>
        <p>Loading school details...</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="school-details">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="empty-state">School not found</div>
      </div>
    );
  }

  return (
    <div className="school-details">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      
      <div className="school-details-card">
        <div className="school-header">
          <div>
            <h1>{school.name}</h1>
            <p className="school-location">{school.location}</p>
            {school.verified && <span className="verified-badge">✓ Verified School</span>}
          </div>
        </div>
        
        <div className="school-info-grid">
          <div className="info-item">
            <label>School Type</label>
            <span>{school.type}</span>
          </div>
          <div className="info-item">
            <label>Established</label>
            <span>{school.established}</span>
          </div>
          <div className="info-item">
            <label>Students</label>
            <span>{school.students}</span>
          </div>
          <div className="info-item">
            <label>Teachers</label>
            <span>{school.teachers}</span>
          </div>
        </div>
        
        <div className="school-description">
          <h3>About the School</h3>
          <p>{school.description}</p>
        </div>
        
        <div className="school-needs-section">
          <h3>Current Needs</h3>
          <div className="needs-grid">
            {school.needs?.map((need, index) => (
              <div key={index} className={`need-card ${selectedNeeds.includes(need) ? 'selected' : ''}`}>
                <div className="need-header">
                  <span className="need-name">{need.item}</span>
                  <span className="need-urgency" style={{ backgroundColor: getUrgencyColor(need.urgency) }}>
                    {need.urgency} priority
                  </span>
                </div>
                <p className="need-description">Quantity needed: {need.quantity}</p>
                <label className="select-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedNeeds.includes(need)}
                    onChange={() => toggleNeedSelection(need)}
                  />
                  Select to donate
                </label>
              </div>
            ))}
          </div>
          
          {selectedNeeds.length > 0 && (
            <div className="donation-summary">
              <h4>Selected Items to Donate</h4>
              <ul>
                {selectedNeeds.map((need, idx) => (
                  <li key={idx}>{need.item} - {need.quantity} items needed</li>
                ))}
              </ul>
              <button 
                className="donate-btn" 
                onClick={handleDonate}
                disabled={donating}
              >
                {donating ? 'Processing...' : `Donate Selected Items (${selectedNeeds.length})`}
              </button>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button className="message-btn" onClick={() => navigate(`/donor/messages/${school.id}`)}>
            💬 Message School
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetails;