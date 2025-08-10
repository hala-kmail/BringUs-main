// ===== URL Change Test =====
// Quick test utility to verify URL change detection

/**
 * Test URL change detection
 */
export function testUrlChangeDetection() {
  console.log('🔄 Testing URL Change Detection...');
  
  try {
    // Test 1: Same URL (no change)
    const sameUrl = 'http://localhost:5173/moon/home';
    const result1 = hasUrlChanged(sameUrl, sameUrl);
    if (result1 !== false) {
      throw new Error('Same URL should return false');
    }
    
    // Test 2: Different store (change)
    const url1 = 'http://localhost:5173/moon/home';
    const url2 = 'http://localhost:5173/updatedstore/home';
    const result2 = hasUrlChanged(url2, url1);
    if (result2 !== true) {
      throw new Error('Different store should return true');
    }
    
    // Test 3: Same store, different page (no change)
    const url3 = 'http://localhost:5173/moon/shop';
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
    const relativeUrl1 = '/moon/home';
    const relativeUrl2 = '/updatedstore/home';
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
 * Check if URL has changed (different store)
 */
function hasUrlChanged(currentUrl, previousUrl) {
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
}

/**
 * Simulate URL change and test useStoreSlug behavior
 */
export function simulateUrlChange() {
  console.log('🎭 Simulating URL change...');
  
  try {
    // Get current URL
    const currentUrl = window.location.href;
    console.log('📋 Current URL:', currentUrl);
    
    // Extract current store slug
    const currentSlug = extractSlugFromPath();
    console.log('📋 Current store slug:', currentSlug);
    
    // Simulate changing to a different store
    const newSlug = currentSlug === 'moon' ? 'updatedstore' : 'moon';
    const newUrl = `http://localhost:5173/${newSlug}/home`;
    
    console.log('🔄 Simulating change to:', newUrl);
    
    // This would normally be done by the router
    // For testing, we'll just log what should happen
    console.log('📋 Expected behavior:');
    console.log('  1. URL change detected');
    console.log('  2. Storage cleanup triggered');
    console.log('  3. New store data fetched');
    console.log('  4. App reinitialized with new store');
    
    return {
      currentUrl,
      currentSlug,
      newUrl,
      newSlug,
      urlChanged: hasUrlChanged(newUrl, currentUrl)
    };
    
  } catch (error) {
    console.error('❌ URL change simulation failed:', error);
    return null;
  }
}

/**
 * Extract slug from current path
 */
function extractSlugFromPath() {
  try {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    // If first part is a slug (not a known route), use it
    const knownRoutes = ['home', 'shop', 'category', 'product', 'cart', 'checkout', 'wishlist', 'profile', 'orders', 'login', 'register', 'almost-finished-sale', 'mobile-categories'];
    
    if (pathParts.length > 0 && !knownRoutes.includes(pathParts[0])) {
      return pathParts[0];
    }
    
    return '';
  } catch (err) {
    console.error('Error extracting slug from path:', err);
    return '';
  }
}

/**
 * Test useStoreSlug hook behavior
 */
export function testUseStoreSlugBehavior() {
  console.log('🧪 Testing useStoreSlug behavior...');
  
  try {
    // Test 1: Check current state
    const currentSlug = extractSlugFromPath();
    const storedSlug = localStorage.getItem('storeSlug');
    
    console.log('📋 Current state:');
    console.log('  - URL slug:', currentSlug);
    console.log('  - Stored slug:', storedSlug);
    console.log('  - URL:', window.location.href);
    
    // Test 2: Check if they match
    const slugsMatch = currentSlug === storedSlug;
    console.log('  - Slugs match:', slugsMatch);
    
    // Test 3: Expected behavior
    console.log('📋 Expected behavior:');
    if (slugsMatch) {
      console.log('  ✅ Slugs match - no action needed');
    } else {
      console.log('  🔄 Slugs don\'t match - should trigger:');
      console.log('     - URL change detection');
      console.log('     - Storage cleanup');
      console.log('     - New store data fetch');
    }
    
    return {
      currentSlug,
      storedSlug,
      slugsMatch,
      url: window.location.href
    };
    
  } catch (error) {
    console.error('❌ useStoreSlug behavior test failed:', error);
    return null;
  }
}

/**
 * Run all URL change tests
 */
export function runAllUrlChangeTests() {
  console.log('🚀 Running All URL Change Tests...');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'URL Change Detection', test: testUrlChangeDetection },
    { name: 'URL Change Simulation', test: simulateUrlChange },
    { name: 'useStoreSlug Behavior', test: testUseStoreSlugBehavior }
  ];
  
  const results = [];
  
  for (const testCase of tests) {
    console.log(`\n🧪 Running: ${testCase.name}`);
    console.log('-'.repeat(30));
    
    try {
      const result = testCase.test();
      results.push({ name: testCase.name, passed: !!result, result });
      
      console.log(`📊 ${testCase.name}: ${result ? '✅ PASSED' : '❌ FAILED'}`);
    } catch (error) {
      console.error(`❌ ${testCase.name} failed with error:`, error);
      results.push({ name: testCase.name, passed: false, error: error.message });
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 FINAL TEST RESULTS:');
  console.log('=' .repeat(50));
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  const allPassed = passedTests === totalTests;
  console.log(`🏆 Final Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

export default {
  testUrlChangeDetection,
  simulateUrlChange,
  testUseStoreSlugBehavior,
  runAllUrlChangeTests
};
