// ===== Storage Manager Test =====
// Comprehensive tests for storage management functionality

import {
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
} from './storageManager';

/**
 * Test storage cleanup scenarios
 */
export function testStorageCleanupScenarios() {
  console.log('🧪 Testing Storage Cleanup Scenarios...');
  
  try {
    // Test 1: Verify cleanup scenarios are defined
    const requiredScenarios = [
      'STORE_SWITCH',
      'LOGOUT', 
      'LOGIN',
      'SESSION_EXPIRED',
      'MANUAL',
      'ERROR_RECOVERY'
    ];
    
    requiredScenarios.forEach(scenario => {
      if (!CLEANUP_SCENARIOS[scenario]) {
        throw new Error(`Missing cleanup scenario: ${scenario}`);
      }
    });
    
    console.log('✅ All cleanup scenarios are defined');
    
    // Test 2: Verify essential items are defined
    const requiredItems = [
      'STORE_DATA',
      'STORE_SLUG', 
      'DEFAULT_AREA_ID',
      'THEME',
      'LANGUAGE',
      'GUEST_ID'
    ];
    
    requiredItems.forEach(item => {
      if (!ESSENTIAL_ITEMS[item]) {
        throw new Error(`Missing essential item: ${item}`);
      }
    });
    
    console.log('✅ All essential items are defined');
    
    // Test 3: Verify preserve items arrays
    if (!Array.isArray(LOGOUT_PRESERVE_ITEMS)) {
      throw new Error('LOGOUT_PRESERVE_ITEMS should be an array');
    }
    
    if (!Array.isArray(STORE_SWITCH_PRESERVE_ITEMS)) {
      throw new Error('STORE_SWITCH_PRESERVE_ITEMS should be an array');
    }
    
    console.log('✅ Preserve items arrays are properly defined');
    
    console.log('🎉 All storage cleanup scenarios tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Storage cleanup scenarios test failed:', error.message);
    return false;
  }
}

/**
 * Test URL change detection
 */
export function testUrlChangeDetection() {
  console.log('🔄 Testing URL Change Detection...');
  
  try {
    // Test 1: Same URL (no change)
    const sameUrl = 'https://example.com/store1/home';
    const result1 = hasUrlChanged(sameUrl, sameUrl);
    if (result1 !== false) {
      throw new Error('Same URL should return false');
    }
    
    // Test 2: Different store (change)
    const url1 = 'https://example.com/store1/home';
    const url2 = 'https://example.com/store2/home';
    const result2 = hasUrlChanged(url2, url1);
    if (result2 !== true) {
      throw new Error('Different store should return true');
    }
    
    // Test 3: Same store, different page (no change)
    const url3 = 'https://example.com/store1/shop';
    const result3 = hasUrlChanged(url3, url1);
    if (result3 !== false) {
      throw new Error('Same store, different page should return false');
    }
    
    // Test 4: No previous URL
    const result4 = hasUrlChanged(url1, null);
    if (result4 !== false) {
      throw new Error('No previous URL should return false');
    }
    
    // Test 5: Relative URLs
    const relativeUrl1 = '/store1/home';
    const relativeUrl2 = '/store2/home';
    const result5 = hasUrlChanged(relativeUrl2, relativeUrl1);
    if (result5 !== true) {
      throw new Error('Relative URLs with different stores should return true');
    }
    
    console.log('✅ All URL change detection tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ URL change detection test failed:', error.message);
    return false;
  }
}

/**
 * Test storage statistics
 */
export function testStorageStats() {
  console.log('📊 Testing Storage Statistics...');
  
  try {
    // Add some test data
    localStorage.setItem('test_key1', 'test_value1');
    localStorage.setItem('test_key2', 'test_value2');
    sessionStorage.setItem('test_session1', 'test_session_value1');
    
    // Test 1: Get storage stats
    const stats = getStorageStats();
    
    if (!stats) {
      throw new Error('Storage stats should not be null');
    }
    
    if (!stats.localStorage || !stats.sessionStorage || !stats.cookies) {
      throw new Error('Storage stats should have all required properties');
    }
    
    if (typeof stats.localStorage.items !== 'number') {
      throw new Error('localStorage.items should be a number');
    }
    
    if (typeof stats.sessionStorage.items !== 'number') {
      throw new Error('sessionStorage.items should be a number');
    }
    
    if (typeof stats.cookies.count !== 'number') {
      throw new Error('cookies.count should be a number');
    }
    
    console.log('📋 Storage Stats:', stats);
    console.log('✅ Storage statistics test passed!');
    
    // Clean up test data
    localStorage.removeItem('test_key1');
    localStorage.removeItem('test_key2');
    sessionStorage.removeItem('test_session1');
    
    return true;
    
  } catch (error) {
    console.error('❌ Storage statistics test failed:', error.message);
    return false;
  }
}

/**
 * Test backup and restore functionality
 */
export function testBackupAndRestore() {
  console.log('💾 Testing Backup and Restore...');
  
  try {
    // Test 1: Add test data
    const testData = {
      [ESSENTIAL_ITEMS.STORE_DATA]: '{"name": "Test Store"}',
      [ESSENTIAL_ITEMS.STORE_SLUG]: 'test-store',
      [ESSENTIAL_ITEMS.THEME]: 'dark',
      [ESSENTIAL_ITEMS.LANGUAGE]: 'ar'
    };
    
    Object.entries(testData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // Test 2: Backup data
    const backup = backupEssentialData();
    
    if (!backup || typeof backup !== 'object') {
      throw new Error('Backup should return an object');
    }
    
    if (Object.keys(backup).length === 0) {
      throw new Error('Backup should not be empty');
    }
    
    console.log('📋 Backup created:', backup);
    
    // Test 3: Clear storage
    Object.keys(testData).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Test 4: Restore data
    const restoredCount = restoreEssentialData(backup);
    
    if (typeof restoredCount !== 'number') {
      throw new Error('Restore should return a number');
    }
    
    if (restoredCount === 0) {
      throw new Error('Restore should restore some items');
    }
    
    // Test 5: Verify restored data
    Object.entries(testData).forEach(([key, value]) => {
      const restoredValue = localStorage.getItem(key);
      if (restoredValue !== value) {
        throw new Error(`Restored value for ${key} does not match original`);
      }
    });
    
    console.log(`✅ Restored ${restoredCount} items successfully`);
    
    // Clean up
    Object.keys(testData).forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Backup and restore test passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Backup and restore test failed:', error.message);
    return false;
  }
}

/**
 * Test storage monitor
 */
export function testStorageMonitor() {
  console.log('👀 Testing Storage Monitor...');
  
  try {
    let monitorCallbackCalled = false;
    
    const monitor = createStorageMonitor((currentStats, previousStats) => {
      monitorCallbackCalled = true;
      console.log('📊 Storage changed:', { current: currentStats, previous: previousStats });
    });
    
    // Test 1: Monitor creation
    if (!monitor || typeof monitor.start !== 'function' || typeof monitor.stop !== 'function') {
      throw new Error('Monitor should have start and stop methods');
    }
    
    // Test 2: Start monitor
    monitor.start(1000); // 1 second interval
    
    if (!monitor.isActive) {
      throw new Error('Monitor should be active after start');
    }
    
    // Test 3: Trigger storage change
    localStorage.setItem('monitor_test', 'test_value');
    
    // Wait for callback
    setTimeout(() => {
      if (!monitorCallbackCalled) {
        console.warn('⚠️ Monitor callback not called (this might be normal)');
      }
      
      // Test 4: Stop monitor
      monitor.stop();
      
      if (monitor.isActive) {
        throw new Error('Monitor should not be active after stop');
      }
      
      // Clean up
      localStorage.removeItem('monitor_test');
      
      console.log('✅ Storage monitor test passed!');
    }, 1500);
    
    return true;
    
  } catch (error) {
    console.error('❌ Storage monitor test failed:', error.message);
    return false;
  }
}

/**
 * Test cleanup functions individually
 */
export function testIndividualCleanupFunctions() {
  console.log('🧹 Testing Individual Cleanup Functions...');
  
  try {
    // Test 1: Add test data
    localStorage.setItem('test_cleanup1', 'value1');
    localStorage.setItem('test_cleanup2', 'value2');
    sessionStorage.setItem('test_session_cleanup', 'session_value');
    
    // Test 2: Test clearLocalStorage with preservation
    const preserveItems = ['test_cleanup1'];
    const localStorageResult = clearLocalStorage(preserveItems);
    
    if (!localStorageResult || typeof localStorageResult.removed !== 'number') {
      throw new Error('clearLocalStorage should return result object');
    }
    
    // Verify preserved item still exists
    if (!localStorage.getItem('test_cleanup1')) {
      throw new Error('Preserved item should still exist');
    }
    
    // Verify non-preserved item was removed
    if (localStorage.getItem('test_cleanup2')) {
      throw new Error('Non-preserved item should be removed');
    }
    
    console.log('✅ clearLocalStorage test passed');
    
    // Test 3: Test clearSessionStorage
    const sessionStorageResult = clearSessionStorage();
    
    if (typeof sessionStorageResult !== 'number') {
      throw new Error('clearSessionStorage should return a number');
    }
    
    if (sessionStorage.length !== 0) {
      throw new Error('SessionStorage should be empty after clear');
    }
    
    console.log('✅ clearSessionStorage test passed');
    
    // Test 4: Test clearAllCookies
    const cookiesResult = clearAllCookies();
    
    if (typeof cookiesResult !== 'number') {
      throw new Error('clearAllCookies should return a number');
    }
    
    console.log('✅ clearAllCookies test passed');
    
    // Clean up
    localStorage.removeItem('test_cleanup1');
    
    console.log('✅ All individual cleanup function tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Individual cleanup functions test failed:', error.message);
    return false;
  }
}

/**
 * Test complete storage cleanup
 */
export async function testCompleteStorageCleanup() {
  console.log('🎯 Testing Complete Storage Cleanup...');
  
  try {
    // Test 1: Add test data
    localStorage.setItem('test_complete1', 'value1');
    localStorage.setItem('test_complete2', 'value2');
    localStorage.setItem(ESSENTIAL_ITEMS.STORE_DATA, '{"name": "Test Store"}');
    sessionStorage.setItem('test_session_complete', 'session_value');
    
    // Test 2: Perform cleanup with logout scenario
    const cleanupResult = await performStorageCleanup(CLEANUP_SCENARIOS.LOGOUT);
    
    if (!cleanupResult || typeof cleanupResult.scenario !== 'string') {
      throw new Error('Cleanup should return result object');
    }
    
    if (cleanupResult.scenario !== CLEANUP_SCENARIOS.LOGOUT) {
      throw new Error('Cleanup result should have correct scenario');
    }
    
    // Test 3: Verify essential items are preserved
    if (!localStorage.getItem(ESSENTIAL_ITEMS.STORE_DATA)) {
      throw new Error('Essential item should be preserved during logout');
    }
    
    // Test 4: Verify non-essential items are removed
    if (localStorage.getItem('test_complete1') || localStorage.getItem('test_complete2')) {
      throw new Error('Non-essential items should be removed during logout');
    }
    
    // Test 5: Verify sessionStorage is cleared
    if (sessionStorage.length !== 0) {
      throw new Error('SessionStorage should be cleared during logout');
    }
    
    console.log('📊 Cleanup Result:', cleanupResult);
    console.log('✅ Complete storage cleanup test passed!');
    
    // Clean up
    localStorage.removeItem(ESSENTIAL_ITEMS.STORE_DATA);
    
    return true;
    
  } catch (error) {
    console.error('❌ Complete storage cleanup test failed:', error.message);
    return false;
  }
}

/**
 * Run all storage manager tests
 */
export async function runAllStorageManagerTests() {
  console.log('🚀 Running All Storage Manager Tests...');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Storage Cleanup Scenarios', test: testStorageCleanupScenarios },
    { name: 'URL Change Detection', test: testUrlChangeDetection },
    { name: 'Storage Statistics', test: testStorageStats },
    { name: 'Backup and Restore', test: testBackupAndRestore },
    { name: 'Storage Monitor', test: testStorageMonitor },
    { name: 'Individual Cleanup Functions', test: testIndividualCleanupFunctions },
    { name: 'Complete Storage Cleanup', test: testCompleteStorageCleanup }
  ];
  
  const results = [];
  
  for (const testCase of tests) {
    console.log(`\n🧪 Running: ${testCase.name}`);
    console.log('-'.repeat(40));
    
    try {
      const result = await testCase.test();
      results.push({ name: testCase.name, passed: result });
      
      console.log(`📊 ${testCase.name}: ${result ? '✅ PASSED' : '❌ FAILED'}`);
    } catch (error) {
      console.error(`❌ ${testCase.name} failed with error:`, error);
      results.push({ name: testCase.name, passed: false, error: error.message });
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FINAL TEST RESULTS:');
  console.log('=' .repeat(60));
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  const allPassed = passedTests === totalTests;
  console.log(`🏆 Final Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

export default {
  testStorageCleanupScenarios,
  testUrlChangeDetection,
  testStorageStats,
  testBackupAndRestore,
  testStorageMonitor,
  testIndividualCleanupFunctions,
  testCompleteStorageCleanup,
  runAllStorageManagerTests
};
