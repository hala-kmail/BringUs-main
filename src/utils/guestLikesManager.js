// ===== Guest Likes Manager =====
// Utility functions for managing guest likes persistence and merging

import { getToken, getBearerToken } from './tokenManager';

const API_BASE_URL = 'http://localhost:5001/api';

// ===== Guest ID Management =====

/**
 * Save Guest ID to localStorage
 * @param {string} guestId - The guest ID to save
 */
export function saveGuestId(guestId) {
  if (guestId) {
    localStorage.setItem('guestId', guestId);
    if (process.env.NODE_ENV === 'development') {
      console.log('💾 Guest ID saved to localStorage:', guestId);
    }
  }
}

/**
 * Get Guest ID from localStorage
 * @returns {string|null} The stored guest ID or null
 */
export function getStoredGuestId() {
  const guestId = localStorage.getItem('guestId');
  if (guestId && process.env.NODE_ENV === 'development') {
    // console.log('📂 Retrieved Guest ID from localStorage:', guestId);
  }
  return guestId;
}

/**
 * Clear Guest ID from localStorage (when user logs in)
 */
export function clearGuestId() {
  localStorage.removeItem('guestId');
  if (process.env.NODE_ENV === 'development') {
    // console.log('🗑️ Guest ID cleared from localStorage');
  }
}

// ===== Headers Management =====

/**
 * Get headers for API requests including Guest ID and Authorization
 * @returns {Object} Headers object
 */
export function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add Guest ID from localStorage if available
  const guestId = getStoredGuestId();
  if (guestId) {
    headers['X-Guest-ID'] = guestId;
  }
  
  // Add token if user is logged in
  const token = getToken();
  if (token) {
    headers['Authorization'] = getBearerToken();
  }
  
  return headers;
}

// ===== API Response Handler =====

/**
 * Handle API response and extract Guest ID from headers
 * @param {Response} response - The fetch response
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function handleApiResponse(response) {
  // Extract Guest ID from response headers
  const guestId = response.headers.get('X-Guest-ID');
  if (guestId) {
    // Only save Guest ID if we don't already have one
    const existingGuestId = getStoredGuestId();
    if (!existingGuestId) {
      saveGuestId(guestId);
      if (process.env.NODE_ENV === 'development') {
        // console.log('🆕 New Guest ID received and saved:', guestId);
      }
    } else if (existingGuestId !== guestId) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('⚠️ Guest ID mismatch - keeping existing:', existingGuestId, 'vs received:', guestId);
      }
    }
  }
  
  return response.json();
}

// ===== Guest Likes Operations =====

/**
 * Like a product as guest
 * @param {string} productId - Product ID to like
 * @param {string} storeSlug - Store slug
 * @returns {Promise<Object|null>} API response or null on error
 */
export async function likeProductAsGuest(productId, storeSlug) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // console.log('👍 Attempting to like product as guest...');
    }
    
    const response = await fetch(`${API_BASE_URL}/likes/${productId}?storeSlug=${storeSlug}`, {
      method: 'POST',
      headers: getHeaders()
    });

    const result = await handleApiResponse(response);
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('✅ Product liked successfully as guest');
      }
      return result;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to like product:', result.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error liking product:', error);
    return null;
  }
}

/**
 * Get guest likes for a store
 * @param {string} storeId - Store ID
 * @returns {Promise<Array>} Array of liked products
 */
export async function getGuestLikes(storeId) {
  try {
    const guestId = getStoredGuestId();
    if (!guestId) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('⚠️ No guest ID found, returning empty likes');
      }
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/likes?storeId=${storeId}`, {
      headers: getHeaders()
    });

    const result = await response.json();
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('📋 Guest likes retrieved:', result.data.length, 'products');
      }
      return result.data;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to get guest likes:', result.message);
      }
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting guest likes:', error);
    return [];
  }
}

/**
 * Unlike a product as guest
 * @param {string} productId - Product ID to unlike
 * @param {string} storeSlug - Store slug
 * @returns {Promise<Object|null>} API response or null on error
 */
export async function unlikeProductAsGuest(productId, storeSlug) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // console.log('👎 Attempting to unlike product as guest...');
    }
    
    const response = await fetch(`${API_BASE_URL}/likes/${productId}?storeSlug=${storeSlug}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const result = await response.json();
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('✅ Product unliked successfully as guest');
      }
      return result;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to unlike product:', result.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error unliking product:', error);
    return null;
  }
}

// ===== Guest Likes Merging =====

/**
 * Merge guest likes to user account after login
 * @param {string} storeId - Store ID
 * @returns {Promise<Object|null>} Merge result or null on error
 */
export async function mergeGuestLikesAfterLogin(storeId) {
  try {
    const guestId = getStoredGuestId();
    if (!guestId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('ℹ️ No guest ID found, nothing to merge');
      }
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Merging guest likes to user account...');
    }

    const response = await fetch(`${API_BASE_URL}/likes/merge-guest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        guestId: guestId,
        storeId: storeId
      })
    });

    const result = await response.json();
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Guest likes merged successfully:', result.message);
        console.log(`📊 Merged: ${result.mergedCount}, Skipped: ${result.skippedCount}`);
      }
      
      // Clear Guest ID from localStorage after successful merge
      clearGuestId();
      
      return result;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to merge guest likes:', result.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error merging guest likes:', error);
    return null;
  }
}

// ===== Login with Likes Merging =====

/**
 * Login and merge guest likes automatically
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} storeId - Store ID
 * @returns {Promise<Object|null>} Login result or null on error
 */
export async function loginAndMergeLikes(email, password, storeId) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Logging in and merging likes...');
    }
    
    // Login
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const loginResult = await loginResponse.json();
    
    if (loginResult.success) {
      // Save token
      localStorage.setItem('authToken', loginResult.data.token);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Login successful');
      }
      
      // Merge guest likes
      await mergeGuestLikesAfterLogin(storeId);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎉 Login and merge completed successfully!');
      }
      return loginResult;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Login failed:', loginResult.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
}

// ===== System Initialization =====

/**
 * Initialize guest system on page load
 * @param {string} storeId - Store ID
 * @returns {Promise<Array>} Array of guest likes
 */
export async function initializeGuestSystem(storeId) {
  if (process.env.NODE_ENV === 'development') {
    // console.log('🚀 Initializing guest system...');
  }
  
  // Check for existing Guest ID
  const guestId = getStoredGuestId();
  if (guestId) {
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 Guest session found:', guestId);
    }
    
    // Load and return guest likes
    const guestLikes = await getGuestLikes(storeId);
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Loaded guest likes:', guestLikes.length, 'products');
    }
    
    return guestLikes;
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('🆕 No guest session found, will create new one on first like');
    }
    return [];
  }
}

// ===== Logout Management =====

/**
 * Handle logout while preserving guest likes
 */
export function logout() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚪 Logging out...');
  }
  
  // Remove token
  localStorage.removeItem('authToken');
  
  // Keep Guest ID for guests (don't delete it as it may contain important likes)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Logout completed');
  }
}

// ===== Utility Functions =====

/**
 * Check if user is guest (no token but has guest ID)
 * @returns {boolean} True if user is guest
 */
export function isGuestUser() {
  const token = getToken();
  const guestId = getStoredGuestId();
  return !token && !!guestId;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated() {
  const token = getToken();
  return !!token;
}

/**
 * Get current user type
 * @returns {'guest'|'authenticated'|'anonymous'} User type
 */
export function getUserType() {
  if (isAuthenticated()) {
    return 'authenticated';
  } else if (isGuestUser()) {
    return 'guest';
  } else {
    return 'anonymous';
  }
}

// ===== Example Usage =====

/**
 * Complete example of persistent guest likes workflow
 * @param {string} storeId - Store ID
 * @param {string} storeSlug - Store slug
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function completePersistentExample(storeId, storeSlug, productId) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Starting persistent guest likes example...');
  }
  
  // 1. Initialize system
  await initializeGuestSystem(storeId);
  
  // 2. Add like as guest
  await likeProductAsGuest(productId, storeSlug);
  
  // 3. Simulate page refresh
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Simulating page refresh...');
  }
  
  // 4. Re-initialize system (after refresh)
  await initializeGuestSystem(storeId);
  
  // 5. Check that like still exists
  const guestLikes = await getGuestLikes(storeId);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Guest likes after refresh:', guestLikes.length, 'products');
  }
  
  // 6. Login and merge likes
  // await loginAndMergeLikes('user@example.com', 'password123', storeId);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Persistent guest likes example completed!');
  }
}

export default {
  saveGuestId,
  getStoredGuestId,
  clearGuestId,
  getHeaders,
  handleApiResponse,
  likeProductAsGuest,
  getGuestLikes,
  unlikeProductAsGuest,
  mergeGuestLikesAfterLogin,
  loginAndMergeLikes,
  initializeGuestSystem,
  logout,
  isGuestUser,
  isAuthenticated,
  getUserType,
  completePersistentExample
};
