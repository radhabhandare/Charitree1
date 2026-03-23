import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('📝 Login form submitted with:', { email, password, role });

    try {
      const result = await login(email, password, role);
      
      console.log('📨 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful! User:', result.user);
        
        // Redirect based on role
        setTimeout(() => {
          switch(role) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'school':
              navigate('/school/dashboard');
              break;
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
      } else {
        setError(result.error || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="ChariTree" className="login-logo" />
          <h1>Welcome Back</h1>
          <p>Login to continue your journey of giving</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Login as</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'donor' ? 'active' : ''}`}
                onClick={() => setRole('donor')}
              >
                Donor
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'school' ? 'active' : ''}`}
                onClick={() => setRole('school')}
              >
                School
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'campaign' ? 'active' : ''}`}
                onClick={() => setRole('campaign')}
              >
                Campaign
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-prompt">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;