import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './BrowseSchools.css';

const BrowseSchools = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    need: '',
    urgency: ''
  });
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchVerifiedSchools();
    fetchFilterOptions();
  }, []);

  const fetchVerifiedSchools = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/schools/verified', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
      // Mock data for development
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/schools/locations');
      setLocations(response.data);
    } catch (error) {
      setLocations(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata']);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return '#d32f2f';
      case 'medium': return '#f57c00';
      case 'low': return '#2e7d32';
      default: return '#666';
    }
  };

  const filteredSchools = schools.filter(school => {
    if (filters.location && school.location !== filters.location) return false;
    if (filters.need) {
      const hasNeed = school.needs?.some(need => need.category === filters.need);
      if (!hasNeed) return false;
    }
    if (filters.urgency) {
      const hasUrgentNeed = school.needs?.some(need => need.urgency === filters.urgency);
      if (!hasUrgentNeed) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="donor-loading">
        <div className="loading-spinner"></div>
        <p>Loading schools...</p>
      </div>
    );
  }

  return (
    <div className="browse-schools">
      <div className="browse-header">
        <h1>Browse Schools</h1>
        <button className="back-btn" onClick={() => navigate('/donor/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="browse-filters">
        <select 
          className="filter-select"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select 
          className="filter-select"
          value={filters.need}
          onChange={(e) => handleFilterChange('need', e.target.value)}
        >
          <option value="">All Needs</option>
          <option value="Books">Books</option>
          <option value="Stationery">Stationery</option>
          <option value="Sports">Sports Equipment</option>
          <option value="Clothing">Uniforms</option>
        </select>

        <select 
          className="filter-select"
          value={filters.urgency}
          onChange={(e) => handleFilterChange('urgency', e.target.value)}
        >
          <option value="">All Urgency</option>
          <option value="high">High Need</option>
          <option value="medium">Medium Need</option>
          <option value="low">Low Need</option>
        </select>
      </div>

      {filteredSchools.length === 0 ? (
        <div className="empty-state">
          <p>No schools found matching your criteria.</p>
        </div>
      ) : (
        <div className="schools-grid">
          {filteredSchools.map(school => (
            <div 
              key={school.id} 
              className="school-card"
              onClick={() => navigate(`/school/${school.id}`)}
            >
              <div className="school-card-body">
                <h2>{school.name}</h2>
                <p className="school-location">{school.location}</p>
                
                <div className="school-stats">
                  <span>👥 {school.students} students</span>
                  <span>🏫 {school.type}</span>
                </div>

                <div className="school-needs">
                  <h3>Needs</h3>
                  {school.needs?.filter(need => need.urgency === 'high').slice(0, 2).map(need => (
                    <div key={need.id} className="need-item">
                      <span className="need-name">{need.item}</span>
                      <span className="need-quantity">Need: {need.quantity}</span>
                      <span 
                        className="need-urgency" 
                        style={{ backgroundColor: getUrgencyColor(need.urgency) }}
                      >
                        {need.urgency}
                      </span>
                    </div>
                  ))}
                  {school.needs?.filter(need => need.urgency === 'high').length === 0 && (
                    <p className="no-needs">No urgent needs at the moment</p>
                  )}
                </div>

                <button className="donate-btn">Donate Now</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseSchools;