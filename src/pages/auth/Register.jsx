import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SchoolSignupForm from '../../components/forms/SchoolSignupForm';
import DonorSignupForm from '../../components/forms/DonorSignupForm';
import CampaignSignupForm from '../../components/forms/CampaignSignupForm';
import './Register.css';
import logo from '../../assets/logo.png';

const Register = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: 'school',
      title: 'School',
      description: 'Register your school to receive donations (Requires verification)',
      icon: '🏫',
      color: '#2e7d32'
    },
    {
      id: 'donor',
      title: 'Individual Donor',
      description: 'Donate items to schools in need',
      icon: '❤️',
      color: '#ffb300'
    },
    {
      id: 'campaign',
      title: 'Campaign Organizer',
      description: 'Create and manage donation campaigns',
      icon: '📢',
      color: '#5d4037'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setStep(2);
    setError('');
  };

  const handleBack = () => {
    setStep(1);
    setSelectedRole(null);
    setError('');
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📝 Submitting registration for role:', selectedRole, formData);
      
      const result = await register(formData, selectedRole);
      
      if (result.success) {
        console.log('✅ Registration successful!', result.user);
        
        // Show different message for school (pending verification)
        if (selectedRole === 'school') {
          alert('School registered successfully! Your account is pending admin verification. You will be able to login once verified.');
          navigate('/login');
        } else {
          // Donors and campaigns can login immediately
          setTimeout(() => {
            switch(selectedRole) {
              case 'donor':
                navigate('/donor/dashboard');
                break;
              case 'campaign':
                navigate('/campaign/dashboard');
                break;
              default:
                navigate('/');
            }
          }, 500);
        }
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <img src={logo} alt="ChariTree" className="register-logo" />
          <h1>Join ChariTree</h1>
          <p>Create your account and start making a difference</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Processing...</div>}

        {step === 1 ? (
          <>
            <div className="role-grid">
              {roles.map((role) => (
                <button
                  key={role.id}
                  className="role-card"
                  onClick={() => handleRoleSelect(role.id)}
                  style={{ '--role-color': role.color }}
                  type="button"
                >
                  <span className="role-icon">{role.icon}</span>
                  <h3>{role.title}</h3>
                  <p>{role.description}</p>
                </button>
              ))}
            </div>

            <div className="login-link">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={handleBack} disabled={loading} type="button">
              ← Back to role selection
            </button>

            {selectedRole === 'school' && (
              <SchoolSignupForm onSubmit={handleSubmit} loading={loading} />
            )}
            {selectedRole === 'donor' && (
              <DonorSignupForm onSubmit={handleSubmit} loading={loading} />
            )}
            {selectedRole === 'campaign' && (
              <CampaignSignupForm onSubmit={handleSubmit} loading={loading} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Register;