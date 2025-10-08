# نظام التحقق من أرقام الهاتف الدولية (Phone Validation System)

## نظرة عامة
نظام متطور للتحقق من صحة أرقام الهاتف الدولية مع دعم خاص للأرقام الفلسطينية (970+) والإسرائيلية (972+).

## المكونات الرئيسية

### 1. CustomPhoneInput Component
مكون React مخصص لإدخال أرقام الهاتف الدولية باستخدام مكتبة `react-phone-input-2`.

**الموقع:** `src/components/common/CustomPhoneInput.jsx`

**المميزات:**
- ✅ دعم جميع مقدمات الدول (Country Codes)
- ✅ واجهة RTL/LTR تلقائية
- ✅ عرض رسائل الأخطاء بشكل واضح
- ✅ تصميم جميل ومتجاوب
- ✅ بحث في قائمة الدول
- ✅ أعلام الدول
- ✅ دعم required field

**مثال الاستخدام:**
```jsx
import CustomPhoneInput from '../common/CustomPhoneInput';

<CustomPhoneInput
  label="رقم الهاتف"
  value={phone}
  onChange={(value) => setPhone('+' + value)}
  error={formErrors.phone}
  required={true}
  placeholder="أدخل رقم الهاتف"
  dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
/>
```

**الخصائص (Props):**
- `label`: تسمية الحقل (اختياري)
- `value`: قيمة رقم الهاتف
- `onChange`: دالة التغيير - تستقبل الرقم بدون +
- `error`: رسالة الخطأ (اختياري)
- `required`: هل الحقل مطلوب (افتراضي: false)
- `placeholder`: النص التوضيحي (اختياري)
- `disabled`: تعطيل الحقل (افتراضي: false)
- `dir`: اتجاه النص - 'rtl' أو 'ltr' (افتراضي: 'ltr')

---

### 2. validateWhatsApp Function
دالة التحقق من صحة رقم الهاتف/WhatsApp بمعايير متقدمة.

**الموقع:** `src/utils/validation.js`

**المعايير:**

#### للأرقام الفلسطينية (970+) والإسرائيلية (972+):
- ✅ الطول الكلي = 12 رقم (970 + 9 أرقام)
- ✅ منع البدء بـ 0 بعد كود الدولة (مثلاً: 970591234567 ✅ | 9700591234567 ❌)
- ✅ التحقق من أن كل الحروف أرقام
- ✅ يجب أن يبدأ بـ +

#### للأرقام الدولية الأخرى:
- ✅ الطول بين 8-15 رقم
- ✅ تنسيق دولي صحيح (+XXX...)
- ✅ التحقق من أن كل الحروف أرقام

**مثال الاستخدام:**
```jsx
import { validateWhatsApp } from '../../utils/validation';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

const phoneError = validateWhatsApp('+970591234567', t);
if (phoneError) {
  console.error(phoneError); // سيعرض رسالة الخطأ المترجمة
}
```

**رسائل الخطأ المحتملة:**
- `store.whatsappNoLeadingZero`: "لا يجب أن يبدأ الرقم بـ 0 بعد مقدمة الدولة"
- `store.whatsappLengthError`: "طول الرقم غير صحيح"
- `store.whatsappInvalidDigits`: "يجب أن يحتوي الرقم على أرقام فقط"
- `store.whatsappInvalidFormat`: "تنسيق رقم الهاتف غير صحيح"

---

### 3. sanitizePhoneNumber Function
دالة مساعدة لتنظيف وتنسيق رقم الهاتف.

**الموقع:** `src/utils/validation.js`

**مثال:**
```jsx
import { sanitizePhoneNumber } from '../../utils/validation';

const cleaned = sanitizePhoneNumber('970 59 123 4567');
console.log(cleaned); // '+970591234567'
```

---

## التطبيق في المشروع

تم تطبيق النظام الجديد في:

### 1. فورم التسجيل (Register Form)
**الملف:** `src/components/Auth/Register.jsx`

```jsx
<CustomPhoneInput
  label={t('auth.register.phone')}
  value={phone}
  onChange={(value) => setPhone('+' + value)}
  error={formErrors.phone}
  required={true}
  placeholder={t('auth.register.phone_placeholder')}
  dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
/>
```

### 2. فورم الدفع (Checkout Form)
**الملف:** `src/components/Checkout/CheckoutForm.jsx`

```jsx
<CustomPhoneInput
  label={t('profile.phone')}
  value={formData.phone}
  onChange={handlePhoneChange}
  error={formErrors.phone}
  required={true}
  placeholder={t('profile.phone_placeholder')}
  dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
/>
```

### 3. صفحة الدفع (Checkout Page)
**الملف:** `src/pages/Checkout/Checkout.jsx`

تم تحديث دالة `validateForm` لاستخدام `validateWhatsApp`:

```jsx
// التحقق من رقم الهاتف باستخدام validateWhatsApp المتطور
if (!formData.phone || !formData.phone.trim()) {
  errors.phone = t('checkout.validation.phone_required');
} else {
  const phoneError = validateWhatsApp(formData.phone, t);
  if (phoneError) {
    errors.phone = phoneError;
  }
}
```

---

## الترجمات (i18n)

تم إضافة مفاتيح جديدة في ملفات الترجمة:

### ar.json
```json
{
  "store": {
    "whatsappNoLeadingZero": "لا يجب أن يبدأ الرقم بـ 0 بعد مقدمة الدولة",
    "whatsappLengthError": "طول الرقم غير صحيح",
    "whatsappInvalidDigits": "يجب أن يحتوي الرقم على أرقام فقط",
    "whatsappInvalidFormat": "تنسيق رقم الهاتف غير صحيح"
  }
}
```

### en.json
```json
{
  "store": {
    "whatsappNoLeadingZero": "Number should not start with 0 after country code",
    "whatsappLengthError": "Invalid phone number length",
    "whatsappInvalidDigits": "Phone number should contain digits only",
    "whatsappInvalidFormat": "Invalid phone number format"
  }
}
```

---

## المكتبات المطلوبة

قبل استخدام النظام، يجب تثبيت المكتبة التالية:

```bash
npm install react-phone-input-2
```

---

## أمثلة على أرقام صحيحة وخاطئة

### ✅ أرقام فلسطينية صحيحة:
- `+970591234567` (12 رقم، يبدأ بـ 5/9/2)
- `+970521234567` (12 رقم، يبدأ بـ 5)

### ❌ أرقام فلسطينية خاطئة:
- `9700591234567` (لا يبدأ بـ +)
- `+970059123456` (يبدأ بـ 0 بعد 970)
- `+97059123456` (11 رقم فقط - قصير)
- `+9705912345678` (13 رقم - طويل)

### ✅ أرقام دولية صحيحة:
- `+12125551234` (أمريكا)
- `+442071234567` (بريطانيا)
- `+966501234567` (السعودية)

---

## التخصيص

### تغيير الدولة الافتراضية:
في ملف `CustomPhoneInput.jsx`، سطر 26:

```jsx
country={'ps'} // فلسطين كدولة افتراضية
```

غير الكود إلى أي دولة تريدها:
- `'il'` - إسرائيل
- `'jo'` - الأردن
- `'sa'` - السعودية
- `'us'` - أمريكا

### تغيير الدول المفضلة:
في ملف `CustomPhoneInput.jsx`، سطر 34:

```jsx
preferredCountries={['ps', 'il', 'jo', 'eg', 'sa', 'ae']}
```

### تخصيص الأسماء المترجمة للدول:
في ملف `CustomPhoneInput.jsx`، سطر 35-41:

```jsx
localization={{
  Palestine: 'فلسطين',
  Israel: 'إسرائيل',
  Jordan: 'الأردن',
  Egypt: 'مصر',
  'Saudi Arabia': 'السعودية',
  'United Arab Emirates': 'الإمارات'
}}
```

---

## الدعم الفني

إذا واجهت أي مشاكل:

1. **تأكد من تثبيت المكتبة:**
   ```bash
   npm install react-phone-input-2
   ```

2. **تأكد من استيراد ملف CSS:**
   ```jsx
   import 'react-phone-input-2/lib/style.css';
   ```

3. **تأكد من إضافة + عند حفظ الرقم:**
   ```jsx
   onChange={(value) => setPhone('+' + value)}
   ```

4. **تأكد من إضافة الترجمات في ملفات i18n**

---

## الإصدارات المستقبلية

ميزات مخططة:
- [ ] دعم التحقق من رقم WhatsApp عبر API
- [ ] حفظ تاريخ الأرقام المستخدمة
- [ ] اقتراحات ذكية للأرقام
- [ ] دعم OTP للتحقق من الهاتف

---

## الترخيص

هذا النظام جزء من مشروع BringUs ومرخص حسب شروط المشروع.

---

**تاريخ الإنشاء:** أكتوبر 2025  
**آخر تحديث:** أكتوبر 2025  
**الإصدار:** 1.0.0


