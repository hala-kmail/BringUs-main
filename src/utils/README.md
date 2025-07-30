# Utils Documentation

This directory contains utility functions for the BringUs application.

## Token Manager

A utility for managing authentication tokens in localStorage.

### Functions

#### `saveToken(token)`
Saves the authentication token to localStorage.

**Parameters:**
- `token` (string): The authentication token to save

**Returns:**
- `boolean`: True if saved successfully, false otherwise

**Example:**
```javascript
import { saveToken } from '../utils/tokenManager';

const success = saveToken('your-jwt-token-here');
if (success) {
  console.log('Token saved successfully');
}
```

#### `getToken()`
Retrieves the authentication token from localStorage.

**Returns:**
- `string|null`: The authentication token or null if not found

**Example:**
```javascript
import { getToken } from '../utils/tokenManager';

const token = getToken();
if (token) {
  console.log('Token found:', token);
} else {
  console.log('No token found');
}
```

#### `removeToken()`
Removes the authentication token from localStorage.

**Returns:**
- `boolean`: True if removed successfully, false otherwise

**Example:**
```javascript
import { removeToken } from '../utils/tokenManager';

const success = removeToken();
if (success) {
  console.log('Token removed successfully');
}
```

#### `hasToken()`
Checks if an authentication token exists.

**Returns:**
- `boolean`: True if token exists, false otherwise

**Example:**
```javascript
import { hasToken } from '../utils/tokenManager';

if (hasToken()) {
  console.log('User is authenticated');
} else {
  console.log('User is not authenticated');
}
```

#### `verifyToken(token)`
Verifies that a token was saved correctly.

**Parameters:**
- `token` (string): The token to verify

**Returns:**
- `boolean`: True if verification successful, false otherwise

**Example:**
```javascript
import { verifyToken } from '../utils/tokenManager';

const token = 'your-jwt-token-here';
saveToken(token);
const isValid = verifyToken(token);
if (isValid) {
  console.log('Token saved and verified successfully');
}
```

#### `getBearerToken()`
Gets the token with Bearer prefix for API calls.

**Returns:**
- `string|null`: Bearer token or null if not found

**Example:**
```javascript
import { getBearerToken } from '../utils/tokenManager';

const bearerToken = getBearerToken();
if (bearerToken) {
  // Use in API calls
  fetch('/api/protected-route', {
    headers: {
      'Authorization': bearerToken
    }
  });
}
```

### Usage in Components

```javascript
import { getToken, hasToken, removeToken } from '../utils/tokenManager';

// Check if user is authenticated
if (hasToken()) {
  // User is logged in
  const token = getToken();
  // Make authenticated API calls
} else {
  // User needs to login
  // Redirect to login page
}

// Logout
const handleLogout = () => {
  removeToken();
  // Clear other user data
  // Redirect to home page
};
```

### Error Handling

All functions include try-catch blocks and provide console logging for debugging:

- Success operations are logged with `console.log`
- Errors are logged with `console.error`
- Functions return appropriate boolean values or null for error cases

### Security Notes

- Tokens are stored in localStorage (consider using httpOnly cookies for production)
- Token verification is done by comparing saved vs provided token
- All operations are wrapped in try-catch for localStorage errors
- Functions handle null/undefined token values gracefully 