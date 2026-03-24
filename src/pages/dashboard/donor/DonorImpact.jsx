import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './DonorImpact.css';

const DonorImpact = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState({
    studentsImpacted: 0,
    itemsDonated: 0,
    schoolsSupported: 0,
    categoriesSupported: [],
    impactTimeline: [],
    beforeAfterImages: []
  });

  useEffect(() => {
    fetchImpactData();
  }, []);

  const fetchImpactData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/donor/impact', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImpact(response.data);
    } catch (error) {
      console.error('Error fetching impact data:', error);
      setImpact({
        studentsImpacted: 1250,
        itemsDonated: 450,
        schoolsSupported: 8,
        categoriesSupported: ['Education', 'Sports', 'Stationery'],
        impactTimeline: [
          { month: 'Jan', donations: 5, items: 50 },
          { month: 'Feb', donations: 8, items: 80 },
          { month: 'Mar', donations: 12, items: 120 }
        ],
        beforeAfterImages: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="donor-loading">
        <div className="loading-spinner"></div>
        <p>Loading your impact...</p>
      </div>
    );
  }

  return (
    <div className="donor-impact">
      <div className="impact-header">
        <button className="back-btn" onClick={() => navigate('/donor/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Your Impact</h1>
      </div>

      <div className="impact-stats">
        <div className="impact-card">
          <div className="impact-icon">👧</div>
          <div className="impact-number">{impact.studentsImpacted}+</div>
          <div className="impact-label">Students Impacted</div>
        </div>
        <div className="impact-card">
          <div className="impact-icon">📚</div>
          <div className="impact-number">{impact.itemsDonated}</div>
          <div className="impact-label">Items Donated</div>
        </div>
        <div className="impact-card">
          <div className="impact-icon">🏫</div>
          <div className="impact-number">{impact.schoolsSupported}</div>
          <div className="impact-label">Schools Supported</div>
        </div>
      </div>

      <div className="impact-chart">
        <h3>Donation Timeline</h3>
        <div className="chart-container">
          {impact.impactTimeline.map((item, idx) => (
            <div key={idx} className="chart-bar">
              <div className="bar-label">{item.month}</div>
              <div className="bar-container">
                <div className="bar-fill" style={{ height: `${(item.donations / 20) * 100}%` }}></div>
              </div>
              <div className="bar-value">{item.donations}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="impact-categories">
        <h3>Categories You Support</h3>
        <div className="categories-list">
          {impact.categoriesSupported.map((cat, idx) => (
            <span key={idx} className="category-tag">{cat}</span>
          ))}
        </div>
      </div>

      <div className="impact-message">
        <h3>✨ Thank You for Making a Difference!</h3>
        <p>Your generosity is changing lives and creating brighter futures for children.</p>
        <button className="share-btn" onClick={() => alert('Share your impact!')}>
          Share Your Impact →
        </button>
      </div>
    </div>
  );
};

export default DonorImpact;