# OTP Verification Component

## Overview
The `OTPVerification` component is a React component designed for email verification using One-Time Password (OTP) functionality. It provides a user-friendly interface for entering a 5-digit verification code sent to the user's email address.

## Features
- **5-digit OTP input**: Supports exactly 5 digits for verification
- **Auto-focus navigation**: Automatically moves focus to the next input field
- **Paste support**: Allows pasting a complete 5-digit code
- **Backspace handling**: Navigates to previous field on backspace
- **Resend functionality**: Includes countdown timer for resending codes
- **Responsive design**: Works on mobile and desktop devices
- **Internationalization**: Supports Arabic and English languages
- **Error handling**: Displays validation and network errors
- **Loading states**: Shows loading indicators during API calls

## Basic Usage

```jsx
import OTPVerification from './components/Auth/OTPVerification';

const MyComponent = () => {
  const handleVerificationSuccess = () => {
    console.log('Email verified successfully!');
  };

  const handleResendCode = () => {
    console.log('Code resent successfully!');
  };

  const handleBack = () => {
    console.log('Go back to previous step');
  };

  return (
    <OTPVerification
      email="user@example.com"
      onVerificationSuccess={handleVerificationSuccess}
      onResendCode={handleResendCode}
      onBack={handleBack}
    />
  );
};
```

## Integration with Register Component

The OTP component is integrated into the registration flow in `Register.jsx`:

```jsx
// In Register.jsx
const [showOTP, setShowOTP] = useState(false);
const [registrationData, setRegistrationData] = useState(null);

const handleSubmit = async (e) => {
  // ... registration logic ...
  
  if (result.success) {
    // Get storeSlug from store context or URL
    const storeSlug = store?.slug || window.location.pathname.split('/')[1] || 'default';
    
    // Send OTP with storeSlug parameter
    const otpResult = await sendOTP(email.trim(), storeSlug);
    
    if (otpResult.success) {
      setRegistrationData(result.data);
      setShowOTP(true);
    }
  }
};

// Conditional rendering
if (showOTP) {
  return (
    <OTPVerification
      email={email}
      onVerificationSuccess={handleOTPSuccess}
      onResendCode={handleOTPResend}
      onBack={handleOTPBack}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `email` | string | Yes | The email address to verify |
| `onVerificationSuccess` | function | No | Callback when verification succeeds |
| `onResendCode` | function | No | Callback when code is resent |
| `onBack` | function | No | Callback when user wants to go back |

## API Integration

The component uses the `useOTP` hook which provides the following API endpoints:

### Endpoints
- **Send OTP**: `POST /api/email-verification/send`
- **Verify OTP**: `POST /api/email-verification/verify`
- **Resend OTP**: `POST /api/email-verification/resend`

### Request/Response Format

#### Send OTP
```javascript
// Request
{
  "email": "user@example.com",
  "storeSlug": "my-store"
}

// Response
{
  "success": true,
  "message": "Verification code sent successfully",
  "data": {
    "email": "user@example.com",
    "expiresIn": "15 minutes"
  }
}
```

#### Verify OTP
```javascript
// Request
{
  "email": "user@example.com",
  "otp": "12345"
}

// Response
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "email": "user@example.com",
    "isEmailVerified": true,
    "emailVerifiedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Resend OTP
```javascript
// Request
{
  "email": "user@example.com",
  "storeSlug": "my-store"
}

// Response
{
  "success": true,
  "message": "New verification code sent successfully",
  "data": {
    "email": "user@example.com",
    "expiresIn": "15 minutes"
  }
}
```

## Translation Keys

The component uses the following translation keys:

### Arabic (`ar.json`)
```json
{
  "auth": {
    "otp": {
      "title": "تأكيد البريد الإلكتروني",
      "subtitle": "تم إرسال رمز التحقق إلى",
      "verification_code": "رمز التحقق",
      "enter_code": "أدخل الرمز المكون من 5 أرقام",
      "verify": "تحقق من الرمز",
      "verifying": "جاري التحقق...",
      "didnt_receive": "لم تستلم الرمز؟",
      "resend_code": "إعادة إرسال الرمز",
      "sending": "جاري الإرسال...",
      "resend_in": "إعادة الإرسال خلال {{seconds}} ثانية",
      "wrong_email": "البريد الإلكتروني خاطئ؟",
      "change_email": "تغيير البريد الإلكتروني"
    }
  }
}
```

### English (`en.json`)
```json
{
  "auth": {
    "otp": {
      "title": "Email Verification",
      "subtitle": "Verification code sent to",
      "verification_code": "Verification Code",
      "enter_code": "Enter the 5-digit code",
      "verify": "Verify Code",
      "verifying": "Verifying...",
      "didnt_receive": "Didn't receive the code?",
      "resend_code": "Resend Code",
      "sending": "Sending...",
      "resend_in": "Resend in {{seconds}} seconds",
      "wrong_email": "Wrong email?",
      "change_email": "Change Email"
    }
  }
}
```

## Styling

The component uses CSS classes defined in `Auth.css`:

### Key CSS Classes
- `.otp-container`: Container for OTP input section
- `.otp-instruction`: Instruction text styling
- `.otp-inputs`: Container for input fields
- `.otp-input`: Individual input field styling
- `.resend-section`: Container for resend functionality
- `.resend-text`: Resend instruction text
- `.resend-button`: Resend button styling

### Responsive Design
The component includes responsive design for mobile devices:
```css
@media (max-width: 480px) {
  .otp-inputs {
    gap: 0.5rem;
  }
  
  .otp-input {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
}
```

## Technical Features

### Auto-navigation
- Automatically focuses the next input field when a digit is entered
- Handles backspace to navigate to previous field
- Supports paste functionality for complete 5-digit codes

### Validation
- Ensures all 5 digits are entered before allowing submission
- Validates that only numeric input is accepted
- Clears error messages when user starts typing

### Countdown Timer
- Implements a 60-second countdown for resend functionality
- Prevents spam clicking on resend button
- Shows remaining time in the button text

### Error Handling
- Displays API errors in a user-friendly format
- Handles network errors gracefully
- Provides fallback navigation if OTP sending fails

## Usage Examples

### Basic Implementation
```jsx
<OTPVerification
  email="user@example.com"
  onVerificationSuccess={() => navigate('/dashboard')}
  onResendCode={() => console.log('Code resent')}
  onBack={() => navigate('/register')}
/>
```

### With Custom Error Handling
```jsx
const handleVerificationSuccess = (data) => {
  // Update user verification status
  updateUserVerificationStatus(data.isEmailVerified);
  navigate('/dashboard');
};

const handleResendCode = () => {
  showNotification('New code sent to your email');
};

<OTPVerification
  email={userEmail}
  onVerificationSuccess={handleVerificationSuccess}
  onResendCode={handleResendCode}
  onBack={() => setShowOTP(false)}
/>
```

## Troubleshooting

### Common Issues

1. **OTP not sending**: Check if `storeSlug` is correctly passed to the API
2. **Verification failing**: Ensure the OTP is exactly 5 digits
3. **Network errors**: Verify API endpoints are accessible
4. **Translation issues**: Ensure all translation keys are defined

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` to see detailed API calls and state changes.

## Future Development

Potential enhancements:
- Support for different OTP lengths (configurable)
- SMS OTP support
- Biometric authentication integration
- Rate limiting improvements
- Accessibility enhancements (screen reader support)

## Dependencies

- React 18+
- react-i18next for internationalization
- Custom hooks: `useOTP`, `useAffiliateNavigation`
- CSS modules or styled-components for styling
