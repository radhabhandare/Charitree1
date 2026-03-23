import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolNeeds.css';

const SchoolNeeds = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [needs, setNeeds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNeed, setNewNeed] = useState({
    item: '',
    quantity: '',
    urgency: 'medium',
    category: ''
  });

  useEffect(() => {
    fetchNeeds();
  }, []);

  const fetchNeeds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/school/needs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNeeds(response.data);
    } catch (error) {
      console.error('Error fetching needs:', error);
      // Use real data from auth context if API fails
      if (window.localStorage.getItem('user')) {
        const user = JSON.parse(localStorage.getItem('user'));
        setNeeds(user?.profile?.needs || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNeed = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/school/needs', newNeed, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setNewNeed({ item: '', quantity: '', urgency: 'medium', category: '' });
      fetchNeeds();
    } catch (error) {
      console.error('Error creating need:', error);
      alert('Failed to create need. Please try again.');
    }
  };

  const handleDeleteNeed = async (needId) => {
    if (window.confirm('Are you sure you want to delete this need?')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/school/needs/${needId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchNeeds();
      } catch (error) {
        console.error('Error deleting need:', error);
        alert('Failed to delete need.');
      }
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'high': return <span className="urgency-high">🔴 High</span>;
      case 'medium': return <span className="urgency-medium">🟡 Medium</span>;
      case 'low': return <span className="urgency-low">🟢 Low</span>;
      default: return <span className="urgency-medium">Medium</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="status-badge pending">Waiting</span>;
      case 'fulfilled': return <span className="status-badge fulfilled">Fulfilled ✓</span>;
      case 'partial': return <span className="status-badge partial">Partial</span>;
      default: return <span className="status-badge pending">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="school-loading">
        <div className="loading-spinner"></div>
        <p>Loading needs...</p>
      </div>
    );
  }

  return (
    <div className="school-needs-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/school/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>School Needs</h1>
        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
          + Post New Need
        </button>
      </div>

      {needs.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>No Needs Posted</h3>
          <p>Click "Post New Need" to let donors know what your school requires.</p>
          <button className="create-btn-primary" onClick={() => setShowCreateModal(true)}>
            + Post Your First Need
          </button>
        </div>
      ) : (
        <div className="needs-table-container">
          <table className="needs-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Category</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {needs.map(need => (
                <tr key={need._id || need.id}>
                  <td><strong>{need.item}</strong></td>
                  <td>{need.quantity}</td>
                  <td>{need.category || 'General'}</td>
                  <td>{getUrgencyBadge(need.urgency)}</td>
                  <td>{getStatusBadge(need.status)}</td>
                  <td>{new Date(need.createdAt || need.date).toLocaleDateString()}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDeleteNeed(need._id || need.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Need Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Post New Need</h3>
            <form onSubmit={handleCreateNeed}>
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  value={newNeed.item}
                  onChange={(e) => setNewNeed({...newNeed, item: e.target.value})}
                  placeholder="e.g., Notebooks, School Bags, Books"
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={newNeed.quantity}
                  onChange={(e) => setNewNeed({...newNeed, quantity: e.target.value})}
                  placeholder="Number of items needed"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Urgency Level *</label>
                <select
                  value={newNeed.urgency}
                  onChange={(e) => setNewNeed({...newNeed, urgency: e.target.value})}
                >
                  <option value="high">High - Urgently Needed</option>
                  <option value="medium">Medium - Needed Soon</option>
                  <option value="low">Low - Can Wait</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category (Optional)</label>
                <input
                  type="text"
                  value={newNeed.category}
                  onChange={(e) => setNewNeed({...newNeed, category: e.target.value})}
                  placeholder="e.g., Education, Sports, Stationery"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Post Need</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolNeeds;