import { STORAGE_KEYS } from './constants';

// ============ AUTH HELPERS ============
export const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

export const getUser = () => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setAuthData = (token, user) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const isAuthenticated = () => {
  const token = getToken();
  return token !== null && token !== undefined && token.length > 0;
};

// ============ DATE HELPERS ============
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

// ============ STRING HELPERS ============
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ============ COLOR HELPERS ============
export const getStatusColor = (status) => {
  const colors = {
    NEW: '#2196F3',
    IN_PROGRESS: '#FF9800',
    RESOLVED: '#4CAF50',
    ARCHIVED: '#9E9E9E',
  };
  return colors[status] || '#6c757d';
};

export const getStatusBgColor = (status) => {
  const colors = {
    NEW: '#e3f2fd',
    IN_PROGRESS: '#fff3e0',
    RESOLVED: '#e8f5e9',
    ARCHIVED: '#f5f5f5',
  };
  return colors[status] || '#f8f9fa';
};

// ============ ROLE HELPERS ============
export const isSuperAdmin = (user) => {
  return user?.roles?.includes('ROLE_SUPER_ADMIN') || false;
};

export const isAdmin = (user) => {
  return user?.roles?.includes('ROLE_ADMIN') || false;
};

// ============ VALIDATION HELPERS ============
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateUsername = (username) => {
  const re = /^[a-zA-Z0-9_]+$/;
  return username && username.length >= 3 && username.length <= 50 && re.test(username);
};

// ============ RATING HELPERS ============
export const renderStars = (rating) => {
  if (!rating) return 'No rating';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  for (let i = 0; i < fullStars; i++) stars += '⭐';
  if (hasHalfStar) stars += '⭐';
  for (let i = 0; i < emptyStars; i++) stars += '☆';
  
  return stars;
};