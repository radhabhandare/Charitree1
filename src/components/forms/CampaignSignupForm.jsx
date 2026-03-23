import { useState } from 'react';
import './FormStyles.css';

const CampaignSignupForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    establishedYear: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    focusAreas: [],
    certificate: null,
    logo: null,
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const focusAreaOptions = [
    'Education',
    'Child Development',
    'Sports',
    'Infrastructure',
    'Digital Literacy',
    'Health & Hygiene',
    'Environment',
    'Community Development'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else if (type === 'checkbox') {
      const updatedAreas = checked 
        ? [...formData.focusAreas, value]
        : formData.focusAreas.filter(area => area !== value);
      
      setFormData({
        ...formData,
        focusAreas: updatedAreas
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.phoneNumber.match(/^[0-9]{10}$/)) newErrors.phoneNumber = 'Enter valid 10-digit number';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.pincode.match(/^[0-9]{6}$/)) newErrors.pincode = 'Enter valid 6-digit pincode';
    if (!formData.certificate) newErrors.certificate = 'Registration certificate is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>Campaign Organization Registration</h2>
      <p className="form-note">Fields marked * are required</p>
      
      <div className="form-row">
        <div className="form-group">
          <label>Organization Name *</label>
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="Enter organization name"
            disabled={loading}
          />
          {errors.organizationName && <span className="error">{errors.organizationName}</span>}
        </div>

        <div className="form-group">
          <label>Organization Type *</label>
          <select
            name="organizationType"
            value={formData.organizationType}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select type</option>
            <option value="ngo">NGO</option>
            <option value="trust">Trust</option>
            <option value="foundation">Foundation</option>
            <option value="society">Society</option>
            <option value="other">Other</option>
          </select>
          {errors.organizationType && <span className="error">{errors.organizationType}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Registration Number</label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="Registration number"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Established Year</label>
          <input
            type="number"
            name="establishedYear"
            value={formData.establishedYear}
            onChange={handleChange}
            placeholder="YYYY"
            min="1800"
            max={new Date().getFullYear()}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Contact Person *</label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="Contact person name"
            disabled={loading}
          />
          {errors.contactPerson && <span className="error">{errors.contactPerson}</span>}
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Organization email"
            disabled={loading}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="10-digit phone number"
            maxLength="10"
            disabled={loading}
          />
          {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
        </div>

        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Address *</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Organization address"
          rows="3"
          disabled={loading}
        />
        {errors.address && <span className="error">{errors.address}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter city"
            disabled={loading}
          />
          {errors.city && <span className="error">{errors.city}</span>}
        </div>

        <div className="form-group">
          <label>State *</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter state"
            disabled={loading}
          />
          {errors.state && <span className="error">{errors.state}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="6-digit pincode"
            maxLength="6"
            disabled={loading}
          />
          {errors.pincode && <span className="error">{errors.pincode}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Organization Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Tell us about your organization..."
          rows="4"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Focus Areas</label>
        <div className="checkbox-grid">
          {focusAreaOptions.map(area => (
            <label key={area} className="checkbox-label">
              <input
                type="checkbox"
                name="focusAreas"
                value={area}
                checked={formData.focusAreas.includes(area)}
                onChange={handleChange}
                disabled={loading}
              />
              {area}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Registration Certificate *</label>
        <input
          type="file"
          name="certificate"
          onChange={handleChange}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={loading}
        />
        <small>Upload registration certificate (PDF or Image)</small>
        {errors.certificate && <span className="error">{errors.certificate}</span>}
      </div>

      <div className="form-group">
        <label>Organization Logo</label>
        <input
          type="file"
          name="logo"
          onChange={handleChange}
          accept="image/*"
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password (min 6 characters)"
            disabled={loading}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            disabled={loading}
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>
      </div>

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? 'Registering...' : 'Register Organization'}
      </button>
    </form>
  );
};

export default CampaignSignupForm;