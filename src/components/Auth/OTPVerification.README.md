# OTP Verification Component

## نظرة عامة
مكون OTP للتحقق من البريد الإلكتروني بنفس الستايل المستخدم في صفحة التسجيل.

## المميزات
- ✅ إدخال رمز OTP مكون من 6 أرقام
- ✅ التنقل التلقائي بين الحقول
- ✅ دعم اللصق (Paste) للرمز كاملاً
- ✅ إعادة إرسال الرمز مع عداد تنازلي
- ✅ دعم اللغتين العربية والإنجليزية
- ✅ تصميم متجاوب
- ✅ رسائل خطأ واضحة
- ✅ تحقق من صحة الإدخال

## الاستخدام

### Basic Usage
```jsx
import OTPVerification from './components/Auth/OTPVerification';

function MyComponent() {
  const handleVerificationSuccess = () => {
    console.log('OTP verified successfully!');
    // التوجيه إلى الصفحة التالية
  };

  const handleResendCode = () => {
    console.log('Code resent successfully!');
  };

  const handleBack = () => {
    console.log('Back to previous step');
  };

  return (
    <OTPVerification
      email="user@example.com"
      onVerificationSuccess={handleVerificationSuccess}
      onResendCode={handleResendCode}
      onBack={handleBack}
    />
  );
}
```

### Integration with Register Component
```jsx
// في مكون التسجيل
const [showOTP, setShowOTP] = useState(false);

const handleSubmit = async (e) => {
  // ... منطق التسجيل
  
  if (result.success) {
    // إرسال OTP
    const otpResult = await sendOTP(email);
    if (otpResult.success) {
      setShowOTP(true);
    }
  }
};

// عرض OTP إذا لزم الأمر
if (showOTP) {
  return (
    <OTPVerification
      email={email}
      onVerificationSuccess={() => navigate('/login')}
      onResendCode={() => console.log('Resent')}
      onBack={() => setShowOTP(false)}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `email` | `string` | ✅ | البريد الإلكتروني المرسل إليه الرمز |
| `onVerificationSuccess` | `function` | ❌ | دالة تُستدعى عند نجاح التحقق |
| `onResendCode` | `function` | ❌ | دالة تُستدعى عند إعادة إرسال الرمز |
| `onBack` | `function` | ❌ | دالة تُستدعى عند الضغط على "تغيير البريد الإلكتروني" |

## API Integration

### Hook: useOTP
```jsx
import useOTP from '../hooks/useOTP';

const { sendOTP, verifyOTP, resendOTP, loading, error } = useOTP();

// إرسال OTP
const result = await sendOTP('user@example.com');

// التحقق من OTP
const verificationResult = await verifyOTP('user@example.com', '123456');

// إعادة إرسال OTP
const resendResult = await resendOTP('user@example.com');
```

### API Endpoints
- `POST /api/auth/send-otp` - إرسال رمز OTP
- `POST /api/auth/verify-otp` - التحقق من رمز OTP

## الترجمة

### العربية (ar.json)
```json
{
  "auth": {
    "otp": {
      "title": "تأكيد البريد الإلكتروني",
      "subtitle": "تم إرسال رمز التحقق إلى",
      "verification_code": "رمز التحقق",
      "enter_code": "أدخل الرمز المكون من 6 أرقام",
      "verify": "تحقق من الرمز",
      "verifying": "جاري التحقق...",
      "didnt_receive": "لم تستلم الرمز؟",
      "resend_code": "إعادة إرسال الرمز",
      "sending": "جاري الإرسال...",
      "resend_in": "إعادة الإرسال خلال {{seconds}} ثانية",
      "wrong_email": "البريد الإلكتروني خاطئ؟",
      "change_email": "تغيير البريد الإلكتروني",
      "verification_failed": "فشل في التحقق من الرمز",
      "network_error": "خطأ في الشبكة، يرجى المحاولة مرة أخرى",
      "resend_failed": "فشل في إعادة إرسال الرمز"
    }
  }
}
```

### الإنجليزية (en.json)
```json
{
  "auth": {
    "otp": {
      "title": "Email Verification",
      "subtitle": "Verification code sent to",
      "verification_code": "Verification Code",
      "enter_code": "Enter the 6-digit code",
      "verify": "Verify Code",
      "verifying": "Verifying...",
      "didnt_receive": "Didn't receive the code?",
      "resend_code": "Resend Code",
      "sending": "Sending...",
      "resend_in": "Resend in {{seconds}} seconds",
      "wrong_email": "Wrong email?",
      "change_email": "Change Email",
      "verification_failed": "Verification failed",
      "network_error": "Network error, please try again",
      "resend_failed": "Failed to resend code"
    }
  }
}
```

## الستايل

المكون يستخدم نفس الستايل الموجود في `Auth.css` مع إضافات خاصة بـ OTP:

```css
/* OTP Input Styles */
.otp-inputs {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.otp-input {
  width: 3rem;
  height: 3.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
}

/* Resend Section */
.resend-section {
  text-align: center;
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.75rem;
}
```

## المميزات التقنية

### التنقل التلقائي
- عند إدخال رقم، يتم الانتقال تلقائياً للحقل التالي
- عند الضغط على Backspace في حقل فارغ، يتم العودة للحقل السابق

### دعم اللصق
- يمكن لصق الرمز كاملاً (6 أرقام) في أي حقل
- يتم توزيع الأرقام تلقائياً على الحقول

### التحقق من الصحة
- يتم التحقق من أن جميع الحقول مملوءة قبل الإرسال
- يتم عرض رسائل خطأ واضحة

### العداد التنازلي
- عداد تنازلي لمدة 60 ثانية بعد إعادة الإرسال
- منع إعادة الإرسال المتكررة

## أمثلة الاستخدام

### 1. في صفحة التسجيل
```jsx
// بعد نجاح التسجيل
if (registrationSuccess) {
  setShowOTP(true);
}
```

### 2. في صفحة منفصلة
```jsx
// في App.jsx
<Route path="/otp-verification" element={<OTPVerification />} />
```

### 3. في Modal
```jsx
// في مكون Modal
{showOTPModal && (
  <Modal>
    <OTPVerification
      email={userEmail}
      onVerificationSuccess={handleSuccess}
      onResendCode={handleResend}
      onBack={handleBack}
    />
  </Modal>
)}
```

## استكشاف الأخطاء

### مشاكل شائعة
1. **لا يتم إرسال OTP**: تأكد من أن API endpoint يعمل بشكل صحيح
2. **لا يتم التحقق**: تأكد من أن الرمز صحيح وأن API يعمل
3. **مشاكل في الترجمة**: تأكد من وجود جميع مفاتيح الترجمة

### Debug
```jsx
// إضافة console.log للتحقق
const handleVerificationSuccess = () => {
  console.log('OTP verified successfully!');
  // منطق إضافي
};
```

## التطوير المستقبلي

- [ ] إضافة دعم للرسائل النصية (SMS)
- [ ] إضافة خيارات تحقق متعددة
- [ ] إضافة دعم للـ biometric authentication
- [ ] إضافة دعم للـ 2FA
