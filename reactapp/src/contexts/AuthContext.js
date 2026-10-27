import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { setAuthData, clearAuthData, getUser, isAuthenticated as checkAuth } from '../utils/helpers';
import { MESSAGES } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getUser();
    const hasToken = checkAuth();
    
    if (hasToken && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await authAPI.login({ username, password });
      console.log('Login response:', response.data);
      
      const { token, username: userName, email } = response.data;
      
      const userData = { 
        username: userName, 
        email: email,
        roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']
      };
      
      // Store in localStorage
      setAuthData(token, userData);
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('✅ Login successful, user set:', userData);
      
      return { success: true, message: MESSAGES.LOGIN_SUCCESS };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data || MESSAGES.LOGIN_FAILED;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    isSuperAdmin: user?.roles?.includes('ROLE_SUPER_ADMIN') || false,
    isAdmin: user?.roles?.includes('ROLE_ADMIN') || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};