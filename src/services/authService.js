import api from './api';

class AuthService {
  async login(email, password, role) {
    try {
      console.log('📡 AuthService - Sending login request...');
      
      const response = await api.post('/auth/login', { 
        email, 
        password, 
        role 
      });
      
      console.log('📥 AuthService - Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('💾 AuthService - Saved to localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ AuthService - Login error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Login failed' };
    }
  }

  async register(userData, role) {
    try {
      console.log('📡 AuthService - Sending register request...', { role, data: userData });
      
      const response = await api.post('/auth/register', { 
        ...userData, 
        role 
      });
      
      console.log('📥 AuthService - Register response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('💾 AuthService - Saved to localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ AuthService - Register error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Registration failed' };
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🗑️ AuthService - Cleared localStorage');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

// Create and export instance
const authService = new AuthService();
export default authService;