import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolAnalytics.css';

const SchoolAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    monthlyDonations: {},
    itemCategories: {},
    needsRatio: { total: 0, fulfilled: 0, pending: 0, percentage: 0 },
    totalDonations: 0,
    totalItems: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/school/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxValue = () => {
    const values = Object.values(analytics.monthlyDonations);
    return Math.max(...values, 1);
  };

  if (loading) {
    return (
      <div className="school-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="school-analytics">
      <div className="analytics-header">
        <button className="back-btn" onClick={() => navigate('/school/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Analytics Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="analytics-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Donations</h3>
            <p className="stat-value">{analytics.totalDonations}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Total Items Received</h3>
            <p className="stat-value">{analytics.totalItems}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Needs Fulfilled</h3>
            <p className="stat-value">{analytics.needsRatio.fulfilled}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Needs</h3>
            <p className="stat-value">{analytics.needsRatio.pending}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <h3>Needs Fulfillment Progress</h3>
        <div className="progress-bar-container">
          <div 
            className="progress-fill"
            style={{ width: `${analytics.needsRatio.percentage}%` }}
          >
            <span>{Math.round(analytics.needsRatio.percentage)}%</span>
          </div>
        </div>
        <p className="progress-stats">
          {analytics.needsRatio.fulfilled} out of {analytics.needsRatio.total} needs fulfilled
        </p>
      </div>

      {/* Monthly Donations Chart */}
      <div className="chart-section">
        <h3>Monthly Donations</h3>
        <div className="bar-chart">
          {Object.entries(analytics.monthlyDonations).map(([month, count]) => (
            <div key={month} className="bar-item">
              <div className="bar-label">{month}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ width: `${(count / getMaxValue()) * 100}%` }}
                >
                  <span className="bar-value">{count}</span>
                </div>
              </div>
            </div>
          ))}
          {Object.keys(analytics.monthlyDonations).length === 0 && (
            <p className="no-data">No donation data available yet</p>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="chart-section">
        <h3>Items by Category</h3>
        <div className="category-list">
          {Object.entries(analytics.itemCategories).map(([category, count]) => (
            <div key={category} className="category-item">
              <span className="category-name">{category}</span>
              <div className="category-bar-container">
                <div 
                  className="category-bar-fill"
                  style={{ width: `${(count / Math.max(...Object.values(analytics.itemCategories), 1)) * 100}%` }}
                />
              </div>
              <span className="category-count">{count}</span>
            </div>
          ))}
          {Object.keys(analytics.itemCategories).length === 0 && (
            <p className="no-data">No category data available yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolAnalytics;