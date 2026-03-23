import { useState } from 'react';
import './FormStyles.css';

const SchoolSignupForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: '',
    establishmentYear: '',
    principalName: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    location: '',
    studentCount: '',
    teacherCount: '',
    description: '',
    needs: [],
    certificate: null,
    schoolPhoto: null,
    password: '',
    confirmPassword: ''
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const needsOptions = [
    'Books',
    'Notebooks',
    'Stationery',
    'School Bags',
    'Sports Kits',
    'Uniforms',
    'Science Equipment',
    'Computer Lab',
    'Furniture',
    'Drinking Water',
    'Toilets',
    'Library Books'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else if (type === 'checkbox') {
      const updatedNeeds = checked 
        ? [...formData.needs, value]
        : formData.needs.filter(need => need !== value);
      
      setFormData({
        ...formData,
        needs: updatedNeeds
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
      if (!formData.schoolType) newErrors.schoolType = 'School type is required';
      if (!formData.principalName.trim()) newErrors.principalName = 'Principal name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.phoneNumber.match(/^[0-9]{10}$/)) newErrors.phoneNumber = 'Enter valid 10-digit number';
    } else if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      if (!formData.pincode.match(/^[0-9]{6}$/)) newErrors.pincode = 'Enter valid 6-digit pincode';
    } else if (step === 3) {
      if (formData.needs.length === 0) newErrors.needs = 'Select at least one need';
      if (!formData.certificate) newErrors.certificate = 'School certificate is required';
    } else if (step === 4) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Basic Info</span>
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Address</span>
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Needs & Docs</span>
        </div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
          <span className="step-number">4</span>
          <span className="step-label">Security</span>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="form-step">
          <h2>School Information</h2>
          <p className="form-note">Fields marked * are required</p>
          
          <div className="form-group">
            <label>School Name *</label>
            <input
              type="text"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="Enter school name"
              disabled={loading}
            />
            {errors.schoolName && <span className="error">{errors.schoolName}</span>}
          </div>

          <div className="form-group">
            <label>School Type *</label>
            <select
              name="schoolType"
              value={formData.schoolType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select type</option>
              <option value="private">Private School</option>
              <option value="government">Government School</option>
              <option value="semi-government">Semi-Government School</option>
            </select>
            {errors.schoolType && <span className="error">{errors.schoolType}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Establishment Year</label>
              <input
                type="number"
                name="establishmentYear"
                value={formData.establishmentYear}
                onChange={handleChange}
                placeholder="YYYY"
                min="1800"
                max={new Date().getFullYear()}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Principal Name *</label>
              <input
                type="text"
                name="principalName"
                value={formData.principalName}
                onChange={handleChange}
                placeholder="Enter principal's name"
                disabled={loading}
              />
              {errors.principalName && <span className="error">{errors.principalName}</span>}
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
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="School email"
                disabled={loading}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Number of Students</label>
              <input
                type="number"
                name="studentCount"
                value={formData.studentCount}
                onChange={handleChange}
                placeholder="Total students"
                min="0"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Number of Teachers</label>
              <input
                type="number"
                name="teacherCount"
                value={formData.teacherCount}
                onChange={handleChange}
                placeholder="Total teachers"
                min="0"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>School Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your school..."
              rows="4"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Step 2: Address Information */}
      {step === 2 && (
        <div className="form-step">
          <h2>School Address</h2>
          <p className="form-note">Fields marked * are required</p>

          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
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

            <div className="form-group">
              <label>Location (Map Pin)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Paste Google Maps link"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Needs & Documents */}
      {step === 3 && (
        <div className="form-step">
          <h2>School Needs & Documents</h2>

          <div className="form-group">
            <label>What does your school need? *</label>
            <div className="checkbox-grid">
              {needsOptions.map(need => (
                <label key={need} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="needs"
                    value={need}
                    checked={formData.needs.includes(need)}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {need}
                </label>
              ))}
            </div>
            {errors.needs && <span className="error">{errors.needs}</span>}
          </div>

          <div className="form-group">
            <label>School Certificate *</label>
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
            <label>School Photo</label>
            <input
              type="file"
              name="schoolPhoto"
              onChange={handleChange}
              accept="image/*"
              disabled={loading}
            />
            <small>Upload a photo of your school</small>
          </div>
        </div>
      )}

      {/* Step 4: Security */}
      {step === 4 && (
        <div className="form-step">
          <h2>Create Password</h2>

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
              placeholder="Confirm your password"
              disabled={loading}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <div className="verification-note">
            <p>⚠️ Note: Your registration will be verified by admin before you can login.</p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="form-navigation">
        {step > 1 && (
          <button type="button" className="secondary-btn" onClick={handlePrevious} disabled={loading}>
            Previous
          </button>
        )}
        
        {step < 4 ? (
          <button type="button" className="primary-btn" onClick={handleNext} disabled={loading}>
            Next
          </button>
        ) : (
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        )}
      </div>
    </form>
  );
};

export default SchoolSignupForm;