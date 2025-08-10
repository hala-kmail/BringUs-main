// ===== Guest ID Tester =====
// Utility to test Guest ID stability and persistence

import { getStoredGuestId, saveGuestId, clearGuestId } from './guestLikesManager';

/**
 * Test Guest ID stability across page refreshes
 */
export function testGuestIdStability() {
  console.log('🧪 Testing Guest ID stability...');
  
  // Get current Guest ID
  const currentGuestId = getStoredGuestId();
  console.log('📋 Current Guest ID:', currentGuestId);
  
  // Simulate page refresh by clearing and checking
  if (currentGuestId) {
    console.log('✅ Guest ID exists and should persist across refreshes');
    return currentGuestId;
  } else {
    console.log('⚠️ No Guest ID found - will be generated on first API call');
    return null;
  }
}

/**
 * Test Guest ID generation and persistence
 */
export function testGuestIdGeneration() {
  console.log('🔧 Testing Guest ID generation...');
  
  // Clear existing Guest ID
  clearGuestId();
  console.log('🗑️ Cleared existing Guest ID');
  
  // Check if cleared
  const afterClear = getStoredGuestId();
  console.log('📋 After clear:', afterClear);
  
  // Generate new Guest ID
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const newGuestId = `guest_${timestamp}_${randomStr}`;
  
  saveGuestId(newGuestId);
  console.log('💾 Generated and saved new Guest ID:', newGuestId);
  
  // Verify it was saved
  const afterSave = getStoredGuestId();
  console.log('📋 After save:', afterSave);
  
  return newGuestId;
}

/**
 * Test Guest ID consistency across multiple calls
 */
export function testGuestIdConsistency() {
  console.log('🔄 Testing Guest ID consistency...');
  
  const guestIds = [];
  
  // Get Guest ID multiple times
  for (let i = 0; i < 5; i++) {
    const guestId = getStoredGuestId();
    guestIds.push(guestId);
    console.log(`📋 Call ${i + 1}:`, guestId);
  }
  
  // Check if all are the same
  const isConsistent = guestIds.every(id => id === guestIds[0]);
  console.log('✅ Guest ID consistency:', isConsistent ? 'PASSED' : 'FAILED');
  
  return isConsistent;
}

/**
 * Complete Guest ID test suite
 */
export function runGuestIdTests() {
  console.log('🚀 Running Guest ID test suite...');
  console.log('=' .repeat(50));
  
  // Test 1: Stability
  const stabilityResult = testGuestIdStability();
  console.log('=' .repeat(50));
  
  // Test 2: Generation
  const generationResult = testGuestIdGeneration();
  console.log('=' .repeat(50));
  
  // Test 3: Consistency
  const consistencyResult = testGuestIdConsistency();
  console.log('=' .repeat(50));
  
  // Summary
  console.log('📊 Test Results:');
  console.log('- Stability:', stabilityResult ? '✅ PASSED' : '⚠️ NO ID');
  console.log('- Generation:', generationResult ? '✅ PASSED' : '❌ FAILED');
  console.log('- Consistency:', consistencyResult ? '✅ PASSED' : '❌ FAILED');
  
  return {
    stability: !!stabilityResult,
    generation: !!generationResult,
    consistency: consistencyResult
  };
}

/**
 * Monitor Guest ID changes in real-time
 */
export function monitorGuestIdChanges() {
  console.log('👀 Monitoring Guest ID changes...');
  
  let lastGuestId = getStoredGuestId();
  console.log('📋 Initial Guest ID:', lastGuestId);
  
  // Check every 2 seconds
  const interval = setInterval(() => {
    const currentGuestId = getStoredGuestId();
    
    if (currentGuestId !== lastGuestId) {
      console.log('🔄 Guest ID changed!');
      console.log('📋 Previous:', lastGuestId);
      console.log('📋 Current:', currentGuestId);
      lastGuestId = currentGuestId;
    }
  }, 2000);
  
  // Return function to stop monitoring
  return () => {
    clearInterval(interval);
    console.log('⏹️ Stopped monitoring Guest ID changes');
  };
}

export default {
  testGuestIdStability,
  testGuestIdGeneration,
  testGuestIdConsistency,
  runGuestIdTests,
  monitorGuestIdChanges
};
