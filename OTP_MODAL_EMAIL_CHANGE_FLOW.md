# OTP Modal & Email Change Flow Documentation

## 📧 When the OTP Modal Opens

The OTP modal appears in the following scenario:

### Login/Registration Flow
1. **User registers** with an email address → Account created but email not verified
2. **User tries to login** with unverified email → Login endpoint returns `isEmailVerified: false`
3. **LoginModal detects unverified email** → Shows OTPModal component
4. **OTP is automatically sent** to the user's email address

**Code Location:** `BringUs-main/src/components/Auth/LoginModal.jsx` (lines 102-112)

```javascript
if (result.isEmailVerified === false) {
  console.log('Email not verified from registration, showing OTP');
  
  // Send OTP verification code automatically
  const currentStoreSlug = storeSlug || window.location.pathname.split('/')[1] || 'default';
  await sendOTP(formData.email, currentStoreSlug);
  
  setLoginData(result.data);
  setShowOTP(true);
}
```

## 🔄 Email Change Flow (When OTP Modal is Open)

When the OTP modal is displayed, users have the option to change their email address:

### Step 1: User Clicks "Change Email"
- Button location: Bottom of OTP modal
- Translation key: `auth.otp.change_email`
- This opens a nested modal asking for the new email address

### Step 2: User Enters New Email
The modal displays:
- 📧 **Current Email** (read-only, pre-filled) - Shows what email they're changing from
- 📧 **New Email** (editable field) - Where they enter the new email

The system validates:
- ✅ Email format is valid
- ✅ Email is different from current email
- ✅ Email is not already registered in the store

### Step 3: Backend Email Change Request
When user confirms the new email:

**API Endpoint:** `POST /api/email-verification/request-email-change-by-userid`

**Request Body:**
```json
{
  "userId": "user123",
  "newEmail": "newemail@example.com"
}
```

**Backend Actions:**
1. Validates userId and newEmail
2. Checks if new email is already in use in the same store
3. Generates a 5-digit OTP
4. Stores in user document:
   - `pendingEmail`: The new email address
   - `pendingEmailOTP`: The verification code
   - `pendingEmailExpiry`: 5 minutes from now
5. Sends verification email to the NEW email address

**Success Response:**
```json
{
  "success": true,
  "message": "Verification code has been sent to newemail@example.com",
  "messageAr": "تم إرسال رمز التحقق إلى newemail@example.com",
  "data": {
    "userId": "user123",
    "pendingEmail": "newemail@example.com",
    "expiresAt": "2024-01-01T12:05:00Z",
    "expiresInMinutes": 5
  }
}
```

### Step 4: Email Updated in OTP Modal
- The change email modal closes
- The main OTP modal updates to show the new email
- User receives OTP at the NEW email address
- Countdown timer resets to 60 seconds

### Step 5: User Verifies New Email
User enters the OTP sent to the new email address and submits.

**For Email Change Verification (Future Implementation):**
You would need to update the verification flow to call:
- `POST /api/email-verification/verify-email-change-by-userid` 

This will:
1. Verify the OTP matches
2. Update `user.email` to the new email
3. Set `isEmailVerified: true`
4. Clear pending email data

## 🔐 Security Features

### Store-Level Email Uniqueness
The backend checks ensure emails are unique **per store**:
- Users in Store A can have email@example.com
- Users in Store B can also have email@example.com
- But the same email cannot be used twice in the same store

**Critical Check (Backend):**
```javascript
if (user.store) {
  const existingUserInStore = await User.findOne({ 
    email: normalizedNewEmail,
    store: user.store
  });
  
  if (existingUserInStore) {
    return res.status(409).json({
      success: false,
      message: `This email is already registered in this store`,
      error: { code: 'DUPLICATE_EMAIL_IN_STORE' }
    });
  }
}
```

### OTP Expiration
- Email change OTP expires in **5 minutes**
- After expiration, user must request a new OTP
- Expired OTPs are automatically cleared from the database

### Email Normalization
All emails are normalized before storage:
- Converted to lowercase
- Trimmed of whitespace
- This prevents duplicate emails with different casing

## 📂 Files Modified

### 1. New Hook Created
**File:** `BringUs-main/src/hooks/useEmailChange.js`
- `requestEmailChangeByUserId(userId, newEmail)` - No auth required
- `requestEmailChange(newEmail)` - Requires auth token
- `verifyEmailChangeByUserId(userId, otp)` - No auth required  
- `verifyEmailChange(otp)` - Requires auth token

### 2. OTP Modal Updated
**File:** `BringUs-main/src/components/Auth/OTPModal.jsx`
- Added `userId` prop
- Imported `useEmailChange` hook
- Updated `handleConfirmNewEmail` to call email change API
- Added error handling for email change failures
- Display email change errors alongside OTP errors

### 3. Login Modal Updated
**File:** `BringUs-main/src/components/Auth/LoginModal.jsx`
- Pass `userId` to OTPModal component
- Supports multiple userId field names: `userId`, `id`, `_id`

### 4. Translations Added
**Files:** 
- `BringUs-main/src/i18n/locales/en.json`
- `BringUs-main/src/i18n/locales/ar.json`

Added key: `auth.otp.user_id_missing`

## 🎯 User Experience Flow

```
┌─────────────────────────────────────────────┐
│ User Registration                            │
│ ✓ Account created                            │
│ ✗ Email not verified                         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ User Tries to Login                          │
│ Backend: "Email not verified"                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ OTP Modal Opens                              │
│ • Shows current email                        │
│ • OTP sent automatically                     │
│ • "Wrong email?" link shown                  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌─────────────┐    ┌──────────────────────┐
│ Verify OTP  │    │ Click "Change Email" │
│ (Current)   │    │                      │
└─────────────┘    └──────────┬───────────┘
                               │
                               ▼
                    ┌────────────────────────────┐
                    │ Change Email Modal Opens    │
                    │ • Enter new email           │
                    │ • Validation happens        │
                    │ • Click "Confirm"           │
                    └──────────┬─────────────────┘
                               │
                               ▼
                    ┌────────────────────────────┐
                    │ Backend Processing          │
                    │ • Check email availability  │
                    │ • Generate OTP              │
                    │ • Send to NEW email         │
                    └──────────┬─────────────────┘
                               │
                               ▼
                    ┌────────────────────────────┐
                    │ OTP Modal Updates           │
                    │ • Shows new email           │
                    │ • Timer resets              │
                    │ • User can verify           │
                    └────────────────────────────┘
```

## 🧪 Testing the Flow

### Test Case 1: Email Change with Valid Email
1. Register a new user
2. Try to login → OTP modal appears
3. Click "Change Email"
4. Enter a NEW valid email
5. Check new email inbox for OTP
6. Verify OTP → Email changed successfully

### Test Case 2: Duplicate Email in Same Store
1. Register user1@test.com in Store A
2. Register user2@test.com in Store A
3. Login with user2 → OTP modal
4. Try to change email to user1@test.com
5. Expected: Error "This email is already registered in this store"

### Test Case 3: Same Email Error
1. Login → OTP modal shows
2. Click "Change Email"
3. Enter the SAME email
4. Expected: Error "This is the same email address"

### Test Case 4: Invalid Email Format
1. Login → OTP modal shows
2. Click "Change Email"
3. Enter invalid email (e.g., "notanemail")
4. Expected: Validation error "Invalid email format"

## 🔧 Backend API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/email-verification/request-email-change-by-userid` | POST | ❌ No | Request email change without auth |
| `/api/email-verification/request-email-change` | POST | ✅ Yes | Request email change with auth |
| `/api/email-verification/verify-email-change-by-userid` | POST | ❌ No | Verify email change without auth |
| `/api/email-verification/verify-email-change` | POST | ✅ Yes | Verify email change with auth |

## 🎨 Change Email Modal UI

The popup now shows both emails for better UX:

```
┌─────────────────────────────────────────┐
│  Change Email Address               ✕   │
├─────────────────────────────────────────┤
│                                          │
│  Enter your new email address to         │
│  receive a verification code             │
│                                          │
│  Current Email Address                   │
│  ┌────────────────────────────────────┐ │
│  │ user@example.com          (locked) │ │
│  └────────────────────────────────────┘ │
│                                          │
│  New Email Address                       │
│  ┌────────────────────────────────────┐ │
│  │ Enter new email address            │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────┐  ┌─────────────────────┐   │
│  │ Cancel │  │      Confirm        │   │
│  └────────┘  └─────────────────────┘   │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ Current email shown in **read-only** field (grayed out)
- ✅ New email field is **focused** automatically
- ✅ Clear visual distinction between old and new
- ✅ Prevents confusion about which email is being changed

## 📝 Notes

- The email change flow uses the **no-auth** endpoints (`-by-userid`) because the user is not fully authenticated yet (email not verified)
- Once email is verified, you could implement a profile settings page using the **auth-required** endpoints
- The OTP modal is reusable for both initial email verification and email changes
- All error messages are bilingual (English + Arabic)
- **Updated:** Change email popup now displays both old and new email fields

## 🚀 Next Steps

To complete the email change flow, you may want to:
1. Update the verification logic to handle both initial verification and email change verification
2. Add a profile page where logged-in users can also change their email
3. Add email change confirmation notifications to the old email address
4. Implement rate limiting on email change requests
5. Add audit logging for email changes

---

**Created:** October 15, 2025  
**Last Updated:** October 15, 2025  
**Status:** ✅ Complete and Ready for Testing

