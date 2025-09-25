// Token Manager Utility
// This file provides utilities for managing authentication tokens

const TOKEN_KEY = 'authToken';

/**
 * Save token to localStorage
 * @param {string} token - The authentication token
 * @returns {boolean} - True if saved successfully, false otherwise
 */
export const saveToken = (token) => {
  try {
    if (!token) {
      console.error('No token provided to save');
      return false;
    }
    
    localStorage.setItem(TOKEN_KEY, token);
   
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

/**
 * Get token from localStorage
 * @returns {string|null} - The authentication token or null if not found
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return token;
    } else {
      // Only log once per session to avoid spam
      if (!window.tokenLogged) {
        window.tokenLogged = true;
      }
      return null;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Remove token from localStorage
 * @returns {boolean} - True if removed successfully, false otherwise
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    console.log('Token removed from localStorage');
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

/**
 * Check if token exists
 * @returns {boolean} - True if token exists, false otherwise
 */
export const hasToken = () => {
  return getToken() !== null;
};

/**
 * Verify token was saved correctly
 * @param {string} token - The token to verify
 * @returns {boolean} - True if verification successful, false otherwise
 */
export const verifyToken = (token) => {
  try {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken === token) {
      console.log('Token verification successful');
      return true;
    } else {
      console.error('Token verification failed');
      return false;
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

/**
 * Get token with Bearer prefix for API calls
 * @returns {string|null} - Bearer token or null if not found
 */
export const getBearerToken = () => {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
};

export default {
  saveToken,
  getToken,
  removeToken,
  hasToken,
  verifyToken,
  getBearerToken,
}; 