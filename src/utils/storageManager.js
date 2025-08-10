// ===== Storage Manager =====
// Comprehensive storage management utility

/**
 * Storage cleanup scenarios
 */
export const CLEANUP_SCENARIOS = {
  STORE_SWITCH: 'store_switch',
  LOGOUT: 'logout',
  LOGIN: 'login',
  SESSION_EXPIRED: 'session_expired',
  MANUAL: 'manual',
  ERROR_RECOVERY: 'error_recovery'
};

/**
 * Essential items to preserve during cleanup
 */
export const ESSENTIAL_ITEMS = {
  STORE_DATA: 'storeData',
  STORE_SLUG: 'storeSlug',
  DEFAULT_AREA_ID: 'defaultAreaId',
  THEME: 'theme',
  LANGUAGE: 'language',
  GUEST_ID: 'guestId' // Preserve guest ID for cart/wishlist continuity
};

/**
 * Items to preserve during logout (keep user preferences)
 */
export const LOGOUT_PRESERVE_ITEMS = [
  ESSENTIAL_ITEMS.STORE_DATA,
  ESSENTIAL_ITEMS.STORE_SLUG,
  ESSENTIAL_ITEMS.DEFAULT_AREA_ID,
  ESSENTIAL_ITEMS.THEME,
  ESSENTIAL_ITEMS.LANGUAGE,
  ESSENTIAL_ITEMS.GUEST_ID
];

/**
 * Items to preserve during store switch (keep user preferences)
 */
export const STORE_SWITCH_PRESERVE_ITEMS = [
  ESSENTIAL_ITEMS.THEME,
  ESSENTIAL_ITEMS.LANGUAGE,
  ESSENTIAL_ITEMS.DEFAULT_AREA_ID
];

/**
 * Clear all cookies for the current domain
 */
export const clearAllCookies = () => {
  try {
    const cookies = document.cookie.split(';');
    let clearedCount = 0;
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (name) {
        // Delete cookie by setting expiration to past date
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        
        // Also try with domain
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        
        // Try with secure flag if on HTTPS
        if (window.location.protocol === 'https:') {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;
        }
        
        clearedCount++;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🗑️ Cleared cookie:', name);
        }
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Cleared ${clearedCount} cookies successfully`);
    }
    
    return clearedCount;
  } catch (error) {
    console.error('❌ Error clearing cookies:', error);
    return 0;
  }
};

/**
 * Clear specific localStorage items while preserving essential ones
 */
export const clearLocalStorage = (preserveItems = []) => {
  try {
    const itemsToPreserve = new Set(preserveItems);
    const keysToRemove = [];
    const preservedItems = [];
    
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (itemsToPreserve.has(key)) {
          preservedItems.push(key);
        } else {
          keysToRemove.push(key);
        }
      }
    }
    
    // Remove non-preserved items
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Removed localStorage item:', key);
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Cleared ${keysToRemove.length} localStorage items`);
      console.log('📋 Preserved items:', preservedItems);
    }
    
    return {
      removed: keysToRemove.length,
      preserved: preservedItems.length,
      removedItems: keysToRemove,
      preservedItems: preservedItems
    };
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
    return { removed: 0, preserved: 0, removedItems: [], preservedItems: [] };
  }
};

/**
 * Clear sessionStorage completely
 */
export const clearSessionStorage = () => {
  try {
    const itemCount = sessionStorage.length;
    sessionStorage.clear();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Cleared ${itemCount} sessionStorage items`);
    }
    
    return itemCount;
  } catch (error) {
    console.error('❌ Error clearing sessionStorage:', error);
    return 0;
  }
};

/**
 * Clear IndexedDB (if available)
 */
export const clearIndexedDB = async () => {
  try {
    if ('indexedDB' in window) {
      const databases = await window.indexedDB.databases();
      let clearedCount = 0;
      
      for (const db of databases) {
        if (db.name) {
          try {
            await window.indexedDB.deleteDatabase(db.name);
            clearedCount++;
            
            if (process.env.NODE_ENV === 'development') {
              console.log('🗑️ Cleared IndexedDB:', db.name);
            }
          } catch (error) {
            console.warn('⚠️ Could not delete IndexedDB:', db.name, error);
          }
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Cleared ${clearedCount} IndexedDB databases`);
      }
      
      return clearedCount;
    }
    
    return 0;
  } catch (error) {
    console.error('❌ Error clearing IndexedDB:', error);
    return 0;
  }
};

/**
 * Complete storage cleanup with scenario-based preservation
 */
export const performStorageCleanup = async (scenario = CLEANUP_SCENARIOS.MANUAL, customPreserveItems = []) => {
  const startTime = Date.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧹 Starting storage cleanup - Scenario: ${scenario}`);
  }
  
  // Determine items to preserve based on scenario
  let preserveItems = [];
  
  switch (scenario) {
    case CLEANUP_SCENARIOS.LOGOUT:
      preserveItems = [...LOGOUT_PRESERVE_ITEMS, ...customPreserveItems];
      break;
    case CLEANUP_SCENARIOS.STORE_SWITCH:
      preserveItems = [...STORE_SWITCH_PRESERVE_ITEMS, ...customPreserveItems];
      break;
    case CLEANUP_SCENARIOS.LOGIN:
      // For login, we might want to clear some items but preserve others
      preserveItems = [ESSENTIAL_ITEMS.STORE_DATA, ESSENTIAL_ITEMS.STORE_SLUG, ...customPreserveItems];
      break;
    case CLEANUP_SCENARIOS.SESSION_EXPIRED:
      // For expired sessions, clear everything except store data
      preserveItems = [ESSENTIAL_ITEMS.STORE_DATA, ESSENTIAL_ITEMS.STORE_SLUG, ...customPreserveItems];
      break;
    case CLEANUP_SCENARIOS.ERROR_RECOVERY:
      // For error recovery, clear everything
      preserveItems = [...customPreserveItems];
      break;
    default:
      preserveItems = [...customPreserveItems];
  }
  
  // Perform cleanup operations
  const results = {
    scenario,
    cookies: clearAllCookies(),
    localStorage: clearLocalStorage(preserveItems),
    sessionStorage: clearSessionStorage(),
    indexedDB: await clearIndexedDB(),
    duration: Date.now() - startTime
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Cleanup Results:', results);
    console.log('🎉 Storage cleanup completed successfully');
  }
  
  return results;
};

/**
 * Check if URL has changed (different store)
 */
export const hasUrlChanged = (currentUrl, previousUrl) => {
  if (!previousUrl) return false;
  
  // Extract store slug from URLs
  const getStoreSlugFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part);
      return pathParts[0] || null;
    } catch (error) {
      // Fallback for relative URLs
      const pathParts = url.split('/').filter(part => part);
      return pathParts[0] || null;
    }
  };
  
  const currentStoreSlug = getStoreSlugFromUrl(currentUrl);
  const previousStoreSlug = getStoreSlugFromUrl(previousUrl);
  
  return currentStoreSlug !== previousStoreSlug;
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = () => {
  try {
    const stats = {
      localStorage: {
        used: 0,
        available: 0,
        items: 0
      },
      sessionStorage: {
        used: 0,
        available: 0,
        items: 0
      },
      cookies: {
        count: 0,
        size: 0
      }
    };
    
    // localStorage stats
    stats.localStorage.items = localStorage.length;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        stats.localStorage.used += key.length + (value ? value.length : 0);
      }
    }
    
    // sessionStorage stats
    stats.sessionStorage.items = sessionStorage.length;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        stats.sessionStorage.used += key.length + (value ? value.length : 0);
      }
    }
    
    // Cookie stats
    const cookies = document.cookie.split(';');
    stats.cookies.count = cookies.length;
    stats.cookies.size = document.cookie.length;
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting storage stats:', error);
    return null;
  }
};

/**
 * Monitor storage changes
 */
export const createStorageMonitor = (callback) => {
  const monitor = {
    isActive: false,
    interval: null,
    lastStats: null
  };
  
  const checkStorage = () => {
    const currentStats = getStorageStats();
    
    if (monitor.lastStats && callback) {
      callback(currentStats, monitor.lastStats);
    }
    
    monitor.lastStats = currentStats;
  };
  
  monitor.start = (intervalMs = 5000) => {
    if (monitor.isActive) return;
    
    monitor.isActive = true;
    monitor.lastStats = getStorageStats();
    monitor.interval = setInterval(checkStorage, intervalMs);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('👀 Storage monitor started');
    }
  };
  
  monitor.stop = () => {
    if (!monitor.isActive) return;
    
    monitor.isActive = false;
    if (monitor.interval) {
      clearInterval(monitor.interval);
      monitor.interval = null;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⏹️ Storage monitor stopped');
    }
  };
  
  return monitor;
};

/**
 * Backup essential data before cleanup
 */
export const backupEssentialData = () => {
  try {
    const backup = {};
    
    // Backup essential items
    Object.values(ESSENTIAL_ITEMS).forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        backup[key] = value;
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('💾 Essential data backed up:', Object.keys(backup));
    }
    
    return backup;
  } catch (error) {
    console.error('❌ Error backing up essential data:', error);
    return {};
  }
};

/**
 * Restore essential data from backup
 */
export const restoreEssentialData = (backup) => {
  try {
    let restoredCount = 0;
    
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, value);
      restoredCount++;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Restored ${restoredCount} essential items`);
    }
    
    return restoredCount;
  } catch (error) {
    console.error('❌ Error restoring essential data:', error);
    return 0;
  }
};

export default {
  CLEANUP_SCENARIOS,
  ESSENTIAL_ITEMS,
  LOGOUT_PRESERVE_ITEMS,
  STORE_SWITCH_PRESERVE_ITEMS,
  clearAllCookies,
  clearLocalStorage,
  clearSessionStorage,
  clearIndexedDB,
  performStorageCleanup,
  hasUrlChanged,
  getStorageStats,
  createStorageMonitor,
  backupEssentialData,
  restoreEssentialData
};
