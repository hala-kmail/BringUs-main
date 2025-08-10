// ===== Quick Guest ID Test =====
// Simple test to verify Guest ID system is working

/**
 * Quick test to verify Guest ID functionality
 */
export function quickGuestIdTest() {
  console.log('🧪 Quick Guest ID Test Starting...');
  
  try {
    // Test 1: Check if localStorage is accessible
    const testKey = 'guestIdTest';
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (testValue !== 'test') {
      throw new Error('localStorage not working properly');
    }
    console.log('✅ localStorage is working');
    
    // Test 2: Check if Guest ID functions can be called
    const { getStoredGuestId, saveGuestId, clearGuestId } = require('./guestLikesManager');
    
    // Test 3: Clear any existing Guest ID
    clearGuestId();
    console.log('✅ Guest ID cleared');
    
    // Test 4: Check initial state
    const initialGuestId = getStoredGuestId();
    if (initialGuestId) {
      throw new Error('Guest ID should be null after clearing');
    }
    console.log('✅ Initial state is correct (no Guest ID)');
    
    // Test 5: Save a test Guest ID
    const testGuestId = 'test_guest_123';
    saveGuestId(testGuestId);
    console.log('✅ Test Guest ID saved');
    
    // Test 6: Retrieve the Guest ID
    const retrievedGuestId = getStoredGuestId();
    if (retrievedGuestId !== testGuestId) {
      throw new Error('Retrieved Guest ID does not match saved one');
    }
    console.log('✅ Guest ID retrieved correctly');
    
    // Test 7: Clear again
    clearGuestId();
    const afterClear = getStoredGuestId();
    if (afterClear) {
      throw new Error('Guest ID should be null after clearing');
    }
    console.log('✅ Guest ID cleared successfully');
    
    console.log('🎉 All Guest ID tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Guest ID test failed:', error.message);
    return false;
  }
}

/**
 * Test Guest ID persistence across function calls
 */
export function testGuestIdPersistence() {
  console.log('🔄 Testing Guest ID persistence...');
  
  try {
    const { getStoredGuestId, saveGuestId } = require('./guestLikesManager');
    
    // Generate a unique Guest ID
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const uniqueGuestId = `guest_${timestamp}_${randomStr}`;
    
    // Save it
    saveGuestId(uniqueGuestId);
    
    // Retrieve it multiple times
    const retrievals = [];
    for (let i = 0; i < 5; i++) {
      const retrieved = getStoredGuestId();
      retrievals.push(retrieved);
    }
    
    // Check if all retrievals are the same
    const isConsistent = retrievals.every(id => id === uniqueGuestId);
    
    if (isConsistent) {
      console.log('✅ Guest ID persistence test passed');
      console.log('📋 Guest ID:', uniqueGuestId);
      console.log('📊 Retrievals:', retrievals.length, 'all consistent');
      return true;
    } else {
      throw new Error('Guest ID not consistent across retrievals');
    }
    
  } catch (error) {
    console.error('❌ Guest ID persistence test failed:', error.message);
    return false;
  }
}

/**
 * Run all quick tests
 */
export function runAllQuickTests() {
  console.log('🚀 Running all quick Guest ID tests...');
  console.log('=' .repeat(50));
  
  const test1 = quickGuestIdTest();
  console.log('=' .repeat(50));
  
  const test2 = testGuestIdPersistence();
  console.log('=' .repeat(50));
  
  console.log('📊 Quick Test Results:');
  console.log('- Basic functionality:', test1 ? '✅ PASSED' : '❌ FAILED');
  console.log('- Persistence:', test2 ? '✅ PASSED' : '❌ FAILED');
  
  const allPassed = test1 && test2;
  console.log('- Overall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
}

export default {
  quickGuestIdTest,
  testGuestIdPersistence,
  runAllQuickTests
};
