// Token Manager Test File
// This file demonstrates how to use the token manager

import { 
  saveToken, 
  getToken, 
  removeToken, 
  hasToken, 
  verifyToken, 
  getBearerToken 
} from './tokenManager';

// Example usage and testing:

/*
1. Save Token:
   const success = saveToken('your-jwt-token-here');
   console.log('Token saved:', success); // true

2. Get Token:
   const token = getToken();
   console.log('Retrieved token:', token); // 'your-jwt-token-here'

3. Check if Token Exists:
   const exists = hasToken();
   console.log('Token exists:', exists); // true

4. Verify Token:
   const isValid = verifyToken('your-jwt-token-here');
   console.log('Token verified:', isValid); // true

5. Get Bearer Token:
   const bearerToken = getBearerToken();
   console.log('Bearer token:', bearerToken); // 'Bearer your-jwt-token-here'

6. Remove Token:
   const removed = removeToken();
   console.log('Token removed:', removed); // true

7. Check After Removal:
   const stillExists = hasToken();
   console.log('Token still exists:', stillExists); // false
*/

// Test function
export const testTokenManager = () => {
  console.log('=== Testing Token Manager ===');
  
  // Test 1: Save token
  const testToken = 'test-jwt-token-123';
  const saveResult = saveToken(testToken);
  console.log('1. Save token:', saveResult);
  
  // Test 2: Get token
  const retrievedToken = getToken();
  console.log('2. Get token:', retrievedToken);
  
  // Test 3: Check if exists
  const exists = hasToken();
  console.log('3. Token exists:', exists);
  
  // Test 4: Verify token
  const verified = verifyToken(testToken);
  console.log('4. Token verified:', verified);
  
  // Test 5: Get bearer token
  const bearerToken = getBearerToken();
  console.log('5. Bearer token:', bearerToken);
  
  // Test 6: Remove token
  const removed = removeToken();
  console.log('6. Token removed:', removed);
  
  // Test 7: Check after removal
  const stillExists = hasToken();
  console.log('7. Token still exists:', stillExists);
  
  console.log('=== Token Manager Test Complete ===');
};

export default {
  testTokenManager,
}; 