# React Hooks Documentation

This directory contains custom React hooks for the BringUs application.

## Available Hooks

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

**Parameters:**
- `storeId` (string, optional): Store ID to auto-fetch

**Returns:**
- `store` (object): Store information
- `loading` (boolean): Loading state
- `error` (string): Error message if any
- `fetchStoreInfo` (function): Fetch store information
- `loadStoredStoreInfo` (function): Load from localStorage
- `saveStoreInfo` (function): Save to localStorage
- `clearStoreInfo` (function): Clear from localStorage

**Store Data Structure:**
```javascript
{
  _id: "store_id",
  nameAr: "اسم المتجر",
  nameEn: "Store Name",
  descriptionAr: "وصف المتجر",
  descriptionEn: "Store Description",
  logo: {
    url: "logo_url",
    public_id: "public_id"
  },
  settings: {
    mainColor: "#140000",
    language: "ar",
    storeDiscount: 10,
    // ... other settings
  },
  contact: {
    address: { /* address info */ },
    email: "contact@store.com",
    phone: "+1234567890"
  }
}
```

## Store Configuration

Both hooks are configured to work with:
- **Store ID:** Fixed store ID (configured in backend)
- **User Role:** "client" (for registration)
- **API Base URL:** `/api/auth/`

## Validation Rules

### Registration Validation:
- First/Last name: 2-50 characters
- Email: Valid email format
- Password: Minimum 6 characters
- Phone: Must start with number or +
- Required fields: area, address, city, country

### Login Validation:
- Email: Valid email format
- Password: Minimum 6 characters

## Error Messages

The hooks provide user-friendly error messages in both English and Arabic, supporting the application's internationalization. 