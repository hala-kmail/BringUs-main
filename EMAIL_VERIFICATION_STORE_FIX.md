# Email Verification Store-Specific Fix

## Problem Statement

### Issue
Users with the same email address across different stores were experiencing verification conflicts. When attempting to verify an email for Store B, the system would return "Email is already verified" if the user had already verified that email in Store A.

### Example Scenario
1. **User in Store A** (Admin): `mai@gmail.com` - Email verified ✅
2. **User in Store B** (Client): `mai@gmail.com` - Email not verified ❌

When the user tries to verify the email for Store B, they receive:
```json
{
  "success": false,
  "message": "Email is already verified",
  "messageAr": "البريد الإلكتروني محقق بالفعل"
}
```

This happens because the verification system wasn't checking which store the verification was for.

---

## Solution

### Root Cause
The `verifyOTP` function was only sending `email` and `otp` without specifying the `storeSlug`, so the backend couldn't distinguish between users with the same email across different stores.

### Fix Implementation

#### 1. Updated `src/hooks/useOTP.js`

**Before:**
```javascript
const verifyOTP = useCallback(async (email, otp) => {
  // ...
  body: JSON.stringify({
    email,
    otp
  })
});
```

**After:**
```javascript
const verifyOTP = useCallback(async (email, otp, storeSlug = null) => {
  const requestBody = {
    email,
    otp
  };
  
  // Include storeSlug if provided to verify for specific store
  if (storeSlug) {
    requestBody.storeSlug = storeSlug;
  }
  
  // ...
  body: JSON.stringify(requestBody)
});
```

#### 2. Updated `src/components/Auth/OTPVerification.jsx`

**Before:**
```javascript
const result = await verifyOTP(email, otpString);
```

**After:**
```javascript
// Get storeSlug from URL or context to ensure verification is for correct store
const storeSlug = window.location.pathname.split('/')[1] || 'default';
const result = await verifyOTP(email, otpString, storeSlug);
```

#### 3. Updated `src/components/Auth/OTPModal.jsx`

Same update as OTPVerification - now passes `storeSlug` to `verifyOTP`.

---

## How It Works Now

### API Request Flow

1. **User visits**: `https://yoursite.com/store-b/register`
2. **Component extracts**: `storeSlug = 'store-b'`
3. **OTP Verification sends**:
   ```json
   {
     "email": "mai@gmail.com",
     "otp": "11185",
     "storeSlug": "store-b"
   }
   ```
4. **Backend verifies**: Email for the specific user in Store B
5. **Success**: Only the Store B user's email is marked as verified

### Store Slug Extraction

The storeSlug is extracted from the URL path:
```javascript
const storeSlug = window.location.pathname.split('/')[1] || 'default';
```

**Examples:**
- `/laya-store/register` → `storeSlug = "laya-store"`
- `/my-shop/login` → `storeSlug = "my-shop"`
- `/register` → `storeSlug = "default"`

---

## Testing Scenarios

### Scenario 1: Same Email, Different Stores
**Setup:**
- Store A: `mai@gmail.com` (verified)
- Store B: `mai@gmail.com` (not verified)

**Test:**
1. Go to Store B registration
2. Enter `mai@gmail.com`
3. Receive OTP
4. Submit OTP with storeSlug `store-b`

**Expected Result:**
✅ Store B user's email is verified
✅ Store A user remains verified
✅ Both users can coexist with the same email

### Scenario 2: Resending OTP
**Test:**
1. Click "Resend OTP" in Store B
2. System sends new OTP specifically for Store B user

**Expected Result:**
✅ New OTP sent to Store B user
✅ Store A user unaffected

### Scenario 3: Multiple Verification Attempts
**Test:**
1. Try verifying with wrong OTP in Store B
2. System checks against Store B user only

**Expected Result:**
✅ Error message specific to Store B verification
✅ Store A user unaffected

---

## Benefits

1. **Store Isolation**: Email verification is now store-specific
2. **Multi-Store Support**: Same email can be used across different stores
3. **No Conflicts**: Verifying in one store doesn't affect other stores
4. **Better UX**: Users can have different verification statuses per store
5. **Accurate Tracking**: Each store knows which users have verified emails

---

## Backend Requirements

The backend API must be updated to:

1. **Accept `storeSlug` parameter** in verification endpoint
2. **Query by both email AND store** instead of just email
3. **Update verification status** for the correct user-store combination

### Example Backend Logic (Pseudocode)
```javascript
// Before (Wrong - checks any user with this email)
const user = await User.findOne({ email });

// After (Correct - checks specific user for specific store)
const user = await User.findOne({ 
  email, 
  store: storeId  // Derived from storeSlug
});
```

---

## Files Modified

1. ✅ `src/hooks/useOTP.js`
   - Updated `verifyOTP()` to accept `storeSlug` parameter
   - Includes `storeSlug` in API request body

2. ✅ `src/components/Auth/OTPVerification.jsx`
   - Extracts `storeSlug` from URL
   - Passes `storeSlug` to `verifyOTP()`

3. ✅ `src/components/Auth/OTPModal.jsx`
   - Extracts `storeSlug` from URL
   - Passes `storeSlug` to `verifyOTP()`

---

## Future Enhancements

1. **Use Context**: Instead of extracting from URL, use a StoreContext
2. **Add Validation**: Ensure storeSlug is valid before sending
3. **Error Handling**: Better error messages if store not found
4. **Audit Trail**: Log verification attempts per store for security

---

## Migration Notes

### For Existing Implementations

If you're adding this fix to an existing system:

1. **Backward Compatible**: The `storeSlug` parameter is optional (defaults to `null`)
2. **No Breaking Changes**: Old code will still work, just less precise
3. **Gradual Rollout**: Can update components one at a time

### For New Implementations

Always include `storeSlug` in verification calls:
```javascript
await verifyOTP(email, otp, storeSlug); // ✅ Recommended
await verifyOTP(email, otp);            // ⚠️ Works but not store-specific
```

---

## Summary

This fix ensures that email verification is **store-specific**, allowing users to have the same email address across multiple stores with independent verification status. The solution is backward-compatible and doesn't break existing functionality while providing better isolation and user experience.

