// ===== Guest Cart Manager =====
// Utility functions for managing guest cart persistence and merging

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

// ===== Guest Cart Operations =====

/**
 * Add product to cart as guest
 * @param {Object} productData - Product data to add
 * @param {string} storeSlug - Store slug
 * @returns {Promise<Object|null>} API response or null on error
 */
export async function addToCartAsGuest(productData, storeSlug) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // console.log('🛒 Adding product to cart as guest...');
    }
    
    const response = await fetch(`${API_BASE_URL}/cart?storeSlug=${storeSlug}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });

    const result = await handleApiResponse(response);
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('✅ Product added to cart successfully');
      }
      return result;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to add product to cart:', result.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error adding product to cart:', error);
    return null;
  }
}

/**
 * Get guest cart for a store
 * @param {string} storeId - Store ID
 * @returns {Promise<Object>} Cart data
 */
export async function getGuestCart(storeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart?storeId=${storeId}`, {
      headers: getHeaders()
    });

    const result = await response.json();
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('📋 Guest cart loaded:', result.data.items.length, 'items');
      }
      return result.data;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to get guest cart:', result.message);
      }
      return { items: [] };
    }
  } catch (error) {
    console.error('❌ Error getting guest cart:', error);
    return { items: [] };
  }
}

/**
 * Update cart item quantity as guest
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @param {string} storeSlug - Store slug
 * @returns {Promise<Object|null>} API response or null on error
 */
export async function updateCartItemAsGuest(productId, quantity, storeSlug) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // console.log('🔄 Updating cart item as guest...');
    }
    
    const response = await fetch(`${API_BASE_URL}/cart/${productId}?storeSlug=${storeSlug}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ quantity })
    });

    const result = await response.json();
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('✅ Cart item updated successfully');
      }
      return result;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to update cart item:', result.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
    return null;
  }
}

/**
 * Remove item from cart as guest
 * @param {string} productId - Product ID
 * @param {string} storeSlug - Store slug
 * @returns {Promise<Object|null>} API response or null on error
 */
export async function removeFromCartAsGuest(productId, storeSlug) {
  try {
    if (process.env.NODE_ENV === 'development') {
      //  console.log('🗑️ Removing item from cart as guest...');
    }
    
    const response = await fetch(`${API_BASE_URL}/cart/${productId}?storeSlug=${storeSlug}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const result = await response.json();
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('✅ Item removed from cart successfully');
      }
      return result;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to remove item from cart:', result.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error removing item from cart:', error);
    return null;
  }
}

/**
 * Clear entire cart as guest
 * @param {string} storeSlug - Store slug
 * @returns {Promise<Object|null>} API response or null on error
 */
export async function clearCartAsGuest(storeSlug) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // console.log('🧹 Clearing cart as guest...');
    }
    
    const response = await fetch(`${API_BASE_URL}/cart?storeSlug=${storeSlug}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const result = await response.json();
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('✅ Cart cleared successfully');
      }
      return result;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to clear cart:', result.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    return null;
  }
}

/**
 * Get cart totals as guest
 * @param {string} storeId - Store ID
 * @returns {Promise<Object|null>} Cart totals or null on error
 */
export async function getCartTotalsAsGuest(storeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/totals?storeId=${storeId}`, {
      headers: getHeaders()
    });

    const result = await response.json();
    
    if (result.success) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('💰 Cart totals loaded:', result.data);
      }
      return result.data;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to get cart totals:', result.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting cart totals:', error);
    return null;
  }
}

// ===== Guest Cart Merging =====

/**
 * Merge guest cart to user account after login
 * @param {string} storeId - Store ID
 * @returns {Promise<Object|null>} Merge result or null on error
 */
export async function mergeGuestCartAfterLogin(storeId) {
  try {
    const guestId = getStoredGuestId();
    if (!guestId) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('ℹ️ No guest ID found, nothing to merge');
      }
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      // console.log('🔄 Merging guest cart to user account...');
    }

    const response = await fetch(`${API_BASE_URL}/cart/merge-guest`, {
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
        // console.log('✅ Guest cart merged successfully:', result.message);
        // console.log(`📊 Merged: ${result.mergedCount}, Updated: ${result.updatedCount}`);
      }
      
      // Clear Guest ID from localStorage after successful merge
      clearGuestId();
      
      return result;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Failed to merge guest cart:', result.message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error merging guest cart:', error);
    return null;
  }
}

// ===== Login with Cart Merging =====

/**
 * Login and merge guest cart automatically
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} storeId - Store ID
 * @returns {Promise<Object|null>} Login result or null on error
 */
export async function loginAndMergeCart(email, password, storeId) {
  try {
    if (process.env.NODE_ENV === 'development') {
      //  console.log('🔐 Logging in and merging cart...');
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
        // console.log('✅ Login successful');
      }
      
      // Merge guest cart
      await mergeGuestCartAfterLogin(storeId);
      
      if (process.env.NODE_ENV === 'development') {
        // console.log('🎉 Login and cart merge completed successfully!');
      }
      return loginResult;
    } else {
      if (process.env.NODE_ENV === 'development') {
        // console.error('❌ Login failed:', loginResult.message);
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
 * Initialize guest cart system on page load
 * @param {string} storeId - Store ID
 * @returns {Promise<Object>} Cart data
 */
export async function initializeGuestCartSystem(storeId) {
  if (process.env.NODE_ENV === 'development') {
    // console.log('🚀 Initializing guest cart system...');
  }
  
  // Check for existing Guest ID
  const guestId = getStoredGuestId();
  if (guestId) {
    if (process.env.NODE_ENV === 'development') {
      // console.log('👤 Guest cart session found:', guestId);
    }
    
    // Load and return guest cart
    const guestCart = await getGuestCart(storeId);
    if (process.env.NODE_ENV === 'development') {
      // console.log('📋 Loaded guest cart:', guestCart.items.length, 'items');
    }
    
    return guestCart;
  } else {
    if (process.env.NODE_ENV === 'development') {
      // console.log('🆕 No guest cart session found, will create new one on first cart action');
    }
    return { items: [] };
  }
}

// ===== Logout Management =====

/**
 * Handle logout while preserving guest cart
 */
export function logout() {
  if (process.env.NODE_ENV === 'development') {
    // console.log('🚪 Logging out...');
  }
  
  // Remove token
  localStorage.removeItem('authToken');
  
  // Keep Guest ID for guests (don't delete it as it may contain important cart items)
  
  if (process.env.NODE_ENV === 'development') {
    // console.log('✅ Logout completed');
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
 * Complete example of persistent guest cart workflow
 * @param {string} storeId - Store ID
 * @param {string} storeSlug - Store slug
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function completePersistentCartExample(storeId, storeSlug, productId) {
  if (process.env.NODE_ENV === 'development') {
    // console.log('🎯 Starting persistent guest cart example...');
  }
  
  // 1. Initialize system
  await initializeGuestCartSystem(storeId);
  
  // 2. Add product to cart as guest
  const productData = {
    product: productId,
    quantity: 2,
    selectedSpecifications: [
      {
        specificationId: 'spec1',
        valueId: 'value1',
        value: 'Red',
        title: 'Color'
      }
    ],
    selectedColors: ['#ff0000']
  };
  
  await addToCartAsGuest(productData, storeSlug);
  
  // 3. Simulate page refresh
  if (process.env.NODE_ENV === 'development') {
    // console.log('🔄 Simulating page refresh...');
  }
  
  // 4. Re-initialize system (after refresh)
  await initializeGuestCartSystem(storeId);
  
  // 5. Check that cart still exists
  const cart = await getGuestCart(storeId);
  if (process.env.NODE_ENV === 'development') {
    //  console.log('✅ Cart after refresh:', cart.items.length, 'items');
  }
  
  // 6. Login and merge cart
  // await loginAndMergeCart('user@example.com', 'password123', storeId);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Persistent guest cart example completed!');
  }
}

export default {
  saveGuestId,
  getStoredGuestId,
  clearGuestId,
  getHeaders,
  handleApiResponse,
  addToCartAsGuest,
  getGuestCart,
  updateCartItemAsGuest,
  removeFromCartAsGuest,
  clearCartAsGuest,
  getCartTotalsAsGuest,
  mergeGuestCartAfterLogin,
  loginAndMergeCart,
  initializeGuestCartSystem,
  logout,
  isGuestUser,
  isAuthenticated,
  getUserType,
  completePersistentCartExample
};
