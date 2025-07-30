# React Hooks Documentation

This directory contains custom React hooks for the BringUs application.

## Available Hooks

### useWishlistAPI

A hook for managing wishlist functionality via the API without using Context.

**API Endpoints:**
- `GET /api/likes` - Fetch user's liked products
- `POST /api/likes/:productId` - Like a product
- `DELETE /api/likes/:productId` - Unlike a product
- `DELETE /api/likes/:productId` (multiple) - Clear entire wishlist (deletes each item individually)

**Features:**
- Fetch liked products from API
- Like/unlike products
- Toggle like status
- Clear entire wishlist
- Loading states and error handling
- Toast notifications
- Authentication check
- Automatic data refresh

**Usage:**
```jsx
import useWishlistAPI from '../hooks/useWishlistAPI';

const {
  wishlistItems,
  loading,
  error,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  toggleWishlist,
  clearWishlist,
  fetchWishlist,
  toast,
  showToast,
  hideToast,
} = useWishlistAPI();

// Like a product
const handleLikeProduct = async (product) => {
  const success = await addToWishlist(product);
  if (success) {
    console.log('Product liked successfully');
  }
};

// Unlike a product
const handleUnlikeProduct = async (productId) => {
  const success = await removeFromWishlist(productId);
  if (success) {
    console.log('Product unliked successfully');
  }
};

// Toggle like status
const handleToggleLike = async (product) => {
  const success = await toggleWishlist(product);
  if (success) {
    console.log('Like status toggled');
  }
};

// Clear entire wishlist
const handleClearWishlist = async () => {
  const success = await clearWishlist();
  if (success) {
    console.log('Wishlist cleared');
  }
};
```

**Parameters:**
- `product` (object): Product object with `_id` or `id` field
- `productId` (string): Product ID to unlike

**Returns:**
- `wishlistItems` (array): Array of liked products from API
- `loading` (boolean): Loading state
- `error` (string): Error message if any
- `addToWishlist` (function): Like a product
- `removeFromWishlist` (function): Unlike a product
- `isInWishlist` (function): Check if product is liked
- `toggleWishlist` (function): Toggle like status
- `clearWishlist` (function): Clear entire wishlist
- `fetchWishlist` (function): Manually fetch liked products
- `toast` (object): Toast notification state
- `showToast` (function): Show toast notification
- `hideToast` (function): Hide toast notification

**Authentication:**
- Requires valid JWT token in localStorage
- Automatically checks for authentication before API calls
- Shows error message if user is not logged in

**Error Handling:**
- Network errors
- Authentication errors
- API validation errors
- User-friendly error messages in Arabic and English

**Toast Notifications:**
- Success messages for successful operations
- Error messages for failed operations
- Info messages for duplicate items
- Automatic hiding after user interaction

**API Response Format:**
The API returns liked products in the following format:
```javascript
{
  success: true,
  data: [
    {
      _id: "like_id",
      productId: "product_id",
      userId: "user_id",
      product: {
        _id: "product_id",
        name: { ar: "اسم المنتج", en: "Product Name" },
        price: 100,
        images: [...],
        // ... other product fields
      }
    }
  ]
}
```

### useCreateUser

A hook for creating new user accounts via the API.

**API Endpoint:** `POST /api/auth/register`

**Features:**
- User registration with validation
- Real-time form validation
- Email existence checking
- Error handling
- Loading states

**Usage:**
```jsx
import useCreateUser from '../hooks/useCreateUser';

const { createUser, loading, error } = useCreateUser();

const handleSubmit = async (userData) => {
  const result = await createUser(userData);
  if (result.success) {
    // Handle success
  }
};
```

**Parameters:**
- `userData` (object): User registration data including:
  - `firstName` (string, 2-50 chars)
  - `lastName` (string, 2-50 chars)
  - `email` (string, valid email format)
  - `password` (string, min 6 chars)
  - `phone` (string, starts with number or +)
  - `area` (string, required)
  - `address` (string, required)
  - `city` (string, required)
  - `zipCode` (string, optional)
  - `country` (string, required)

**Returns:**
- `createUser` (function): Function to create user
- `loading` (boolean): Loading state
- `error` (string): Error message if any
- `emailExists` (boolean): Whether email already exists

### useLogin

A hook for user authentication via the login API with automatic store information loading.

**API Endpoint:** `POST /api/auth/login`

**Features:**
- User authentication with email and password
- Automatic store information loading after successful login
- Token storage in localStorage
- Store information persistence
- Error handling for invalid credentials
- Loading states
- Automatic logout functionality

**Usage:**
```jsx
import useLogin from '../hooks/useLogin';

const { login, logout, loading, error, user, store, isAuthenticated, loadStoredData } = useLogin();

const handleLogin = async (email, password) => {
  const result = await login(email, password);
  if (result.success) {
    // Handle successful login
    console.log('Store info:', result.store);
  }
};

// Load stored data on app start
useEffect(() => {
  loadStoredData();
}, []);
```

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password

**Returns:**
- `login` (function): Function to authenticate user
- `logout` (function): Function to log out user
- `loading` (boolean): Loading state
- `error` (string): Error message if any
- `user` (object): User data if authenticated
- `store` (object): Store information if available
- `isAuthenticated` (boolean): Whether user is logged in
- `loadStoredData` (function): Load stored data from localStorage

**Store Information:**
- Automatically fetched after successful login
- Includes store logo, name, description, settings, and contact info
- Stored in localStorage for persistence
- Cleared on logout

**Error Handling:**
- 401: Invalid email or password
- 422: Validation errors
- Network errors: Connection issues

**Token Management:**
- Automatically stores JWT token in localStorage
- Removes token on logout
- Token can be accessed via `localStorage.getItem('authToken')`

### useStore

A hook for fetching and managing store information.

**API Endpoint:** `GET /api/stores/{id}`

**Features:**
- Fetch store information by store ID
- Store information caching in localStorage
- Loading states and error handling
- Automatic token-based authentication

**Usage:**
```jsx
import useStore from '../hooks/useStore';

// Auto-fetch store info
const { store, loading, error } = useStore('store_id_here');

// Manual fetch
const { fetchStoreInfo, loadStoredStoreInfo, saveStoreInfo } = useStore();

const handleFetchStore = async () => {
  const token = localStorage.getItem('authToken');
  const storeData = await fetchStoreInfo('store_id', token);
  if (storeData) {
    saveStoreInfo(storeData);
  }
};
```