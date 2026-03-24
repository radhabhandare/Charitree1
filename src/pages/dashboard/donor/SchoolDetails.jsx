import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolDetails.css';

const SchoolDetails = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [quantities, setQuantities] = useState({});

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
      console.log('✅ School details fetched:', response.data);
      setSchool(response.data);
      
      // Initialize quantities
      const initialQuantities = {};
      response.data.needs?.forEach(need => {
        initialQuantities[need._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching school details:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (selectedNeeds.length === 0) {
      alert('Please select items to donate');
      return;
    }

    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('donationCart') || '[]');
    
    // Add selected items
    const newItems = selectedNeeds.map(need => ({
      needId: need._id,
      schoolId: school._id,
      schoolName: school.schoolName,
      itemName: need.item,
      quantity: quantities[need._id] || 1,
      maxQuantity: need.quantity
    }));
    
    const updatedCart = [...existingCart, ...newItems];
    localStorage.setItem('donationCart', JSON.stringify(updatedCart));
    
    alert(`${selectedNeeds.length} item(s) added to cart!`);
    navigate('/donor/cart');
  };

  const toggleNeedSelection = (need) => {
    setSelectedNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need)
        : [...prev, need]
    );
  };

  const updateQuantity = (needId, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [needId]: Math.max(1, Math.min(quantity, school?.needs?.find(n => n._id === needId)?.quantity || 1))
    }));
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
            <h1>{school.schoolName}</h1>
            <p className="school-location">{school.address?.city}, {school.address?.state} - {school.address?.pincode}</p>
            {school.verificationStatus === 'verified' && (
              <span className="verified-badge">✓ Verified School</span>
            )}
          </div>
        </div>
        
        <div className="school-info-grid">
          <div className="info-item">
            <label>School Type</label>
            <span>{school.schoolType}</span>
          </div>
          <div className="info-item">
            <label>Established</label>
            <span>{school.establishmentYear}</span>
          </div>
          <div className="info-item">
            <label>Students</label>
            <span>{school.studentCount}</span>
          </div>
          <div className="info-item">
            <label>Teachers</label>
            <span>{school.teacherCount}</span>
          </div>
          <div className="info-item">
            <label>Principal</label>
            <span>{school.principalName}</span>
          </div>
          <div className="info-item">
            <label>Phone</label>
            <span>{school.phoneNumber}</span>
          </div>
        </div>
        
        <div className="school-description">
          <h3>About the School</h3>
          <p>{school.description || 'No description available.'}</p>
        </div>
        
        <div className="school-needs-section">
          <h3>Current Needs</h3>
          <div className="needs-grid">
            {school.needs?.map((need) => (
              <div key={need._id} className={`need-card ${selectedNeeds.includes(need) ? 'selected' : ''}`}>
                <div className="need-header">
                  <span className="need-name">{need.item}</span>
                  <span className="need-urgency" style={{ backgroundColor: getUrgencyColor(need.urgency) }}>
                    {need.urgency} priority
                  </span>
                </div>
                <p className="need-description">Required: {need.quantity} items</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(need.fulfilled / need.quantity) * 100}%` }}
                  ></div>
                  <span className="progress-text">{need.fulfilled} / {need.quantity} received</span>
                </div>
                <div className="need-quantity-select">
                  <label>Quantity to donate:</label>
                  <input
                    type="number"
                    min="1"
                    max={need.quantity - need.fulfilled}
                    value={quantities[need._id] || 1}
                    onChange={(e) => updateQuantity(need._id, parseInt(e.target.value))}
                    disabled={!selectedNeeds.includes(need)}
                  />
                </div>
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
              <h4>Selected Items</h4>
              <ul>
                {selectedNeeds.map((need, idx) => (
                  <li key={idx}>
                    {need.item} - {quantities[need._id] || 1} item(s)
                  </li>
                ))}
              </ul>
              <button 
                className="donate-btn" 
                onClick={addToCart}
              >
                Add to Cart ({selectedNeeds.length} items)
              </button>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button className="message-btn" onClick={() => navigate(`/donor/messages/${school._id}`)}>
            💬 Message School
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetails;