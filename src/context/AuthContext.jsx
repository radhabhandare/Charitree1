import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      console.log('🔍 AuthProvider - Initializing...');
      console.log('📦 Stored user:', storedUser);
      console.log('🔑 Stored token:', storedToken);
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('✅ User restored from localStorage:', parsedUser);
        } catch (error) {
          console.error('❌ Error parsing stored user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      console.log('🔐 AuthContext - Login attempt:', { email, role });
      
      const response = await authService.login(email, password, role);
      console.log('✅ AuthContext - Login response:', response);
      
      if (response.success) {
        setUser(response.user);
        console.log('💾 AuthContext - User set in state:', response.user);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('❌ AuthContext - Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (userData, role) => {
    try {
      console.log('📝 AuthContext - Register attempt:', { email: userData.email, role });
      
      const response = await authService.register(userData, role);
      console.log('✅ AuthContext - Register response:', response);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('❌ AuthContext - Register error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    console.log('👋 AuthContext - User logged out');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};