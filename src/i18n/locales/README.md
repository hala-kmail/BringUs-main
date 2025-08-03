# Translation Files Documentation

## نظرة عامة
هذا المجلد يحتوي على ملفات الترجمة للغتين العربية والإنجليزية.

## الملفات

### `ar.json` - الترجمة العربية
### `en.json` - الترجمة الإنجليزية

## بنية الترجمة

### قسم Profile (الملف الشخصي)

#### الترجمات الموجودة:

**العربية (`ar.json`):**
```json
{
  "profile": {
    "title": "الملف الشخصي",
    "subtitle": "إدارة معلوماتك الشخصية وتفضيلاتك",
    "personal_info": "المعلومات الشخصية",
    "orders": "الطلبات",
    "wishlist": "المفضلة",
    "settings": "الإعدادات",
    "logout": "تسجيل الخروج",
    "member_since": "عضو منذ",
    "wishlist_items": "عناصر المفضلة",
    "cart_items": "عناصر السلة",
    "edit": "تعديل",
    "save": "حفظ",
    "first_name": "الاسم الأول",
    "last_name": "اسم العائلة",
    "email": "البريد الإلكتروني",
    "phone": "رقم الهاتف",
    "address": "العنوان",
    "street": "الشارع",
    "city": "المدينة",
    "state": "الولاية/المحافظة",
    "zip_code": "الرمز البريدي",
    "country": "البلد",
    "no_orders": "لا توجد طلبات",
    "no_orders_desc": "لم تقم بأي طلب بعد. ابدأ التسوق الآن!",
    "no_wishlist": "المفضلة فارغة",
    "no_wishlist_desc": "لم تضيف أي منتجات للمفضلة بعد. ابدأ التسوق الآن!",
    "start_shopping": "ابدأ التسوق",
    "notifications": "الإشعارات",
    "email_notifications": "إشعارات البريد الإلكتروني",
    "email_notifications_desc": "استلام إشعارات عبر البريد الإلكتروني",
    "order_updates": "تحديثات الطلبات",
    "order_updates_desc": "إشعارات حول حالة طلباتك",
    "privacy": "الخصوصية",
    "profile_visibility": "رؤية الملف الشخصي",
    "profile_visibility_desc": "السماح للآخرين برؤية ملفك الشخصي",
    "click_to_view": "انقر للعرض"
  }
}
```

**الإنجليزية (`en.json`):**
```json
{
  "profile": {
    "title": "Profile",
    "subtitle": "Manage your personal information and preferences",
    "personal_info": "Personal Information",
    "orders": "Orders",
    "wishlist": "Wishlist",
    "settings": "Settings",
    "logout": "Logout",
    "member_since": "Member since",
    "wishlist_items": "Wishlist Items",
    "cart_items": "Cart Items",
    "edit": "Edit",
    "save": "Save",
    "first_name": "First Name",
    "last_name": "Last Name",
    "email": "Email",
    "phone": "Phone Number",
    "address": "Address",
    "street": "Street",
    "city": "City",
    "state": "State/Province",
    "zip_code": "Zip Code",
    "country": "Country",
    "no_orders": "No Orders",
    "no_orders_desc": "You haven't placed any orders yet. Start shopping now!",
    "no_wishlist": "Wishlist Empty",
    "no_wishlist_desc": "You haven't added any products to your wishlist yet. Start shopping now!",
    "start_shopping": "Start Shopping",
    "notifications": "Notifications",
    "email_notifications": "Email Notifications",
    "email_notifications_desc": "Receive notifications via email",
    "order_updates": "Order Updates",
    "order_updates_desc": "Notifications about your order status",
    "privacy": "Privacy",
    "profile_visibility": "Profile Visibility",
    "profile_visibility_desc": "Allow others to see your profile",
    "click_to_view": "Click to view"
  }
}
```

## الاستخدام في الكود

### في React Components:
```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('profile.title')}</h1>
      <p>{t('profile.subtitle')}</p>
      <button>{t('profile.edit')}</button>
    </div>
  );
};
```

### تغيير اللغة:
```javascript
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
  
  return (
    <div>
      <button onClick={() => changeLanguage('ar')}>العربية</button>
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  );
};
```

## إضافة ترجمات جديدة

### 1. إضافة مفتاح جديد:
```json
{
  "profile": {
    "new_key": "New Translation"
  }
}
```

### 2. إضافة قسم جديد:
```json
{
  "new_section": {
    "title": "Section Title",
    "description": "Section Description"
  }
}
```

## أفضل الممارسات

### 1. تسمية المفاتيح:
- استخدم أسماء وصفية وواضحة
- استخدم underscore للفصل بين الكلمات
- اتبع نمط تسلسلي هرمي

### 2. التنظيم:
- اجمع الترجمات المتعلقة في نفس القسم
- استخدم تعليقات لتوضيح الغرض من كل قسم

### 3. الصيانة:
- تأكد من وجود جميع المفاتيح في كلا الملفين
- تحقق من صحة بنية JSON
- اختبر الترجمات في التطبيق

## التحقق من الترجمات

### 1. التحقق من وجود المفاتيح:
```javascript
// في وحدة التحكم
console.log(t('profile.title')); // يجب أن يعرض الترجمة
console.log(t('profile.non_existent')); // يجب أن يعرض المفتاح نفسه
```

### 2. التحقق من بنية JSON:
```bash
# في Terminal
node -e "console.log(JSON.parse(require('fs').readFileSync('ar.json', 'utf8')))"
node -e "console.log(JSON.parse(require('fs').readFileSync('en.json', 'utf8')))"
```

## ملاحظات مهمة

1. **جميع الترجمات موجودة** في كلا الملفين
2. **بنية JSON صحيحة** في كلا الملفين
3. **دعم كامل للغتين** العربية والإنجليزية
4. **ترجمات شاملة** لجميع أقسام صفحة البروفايل

## استكشاف الأخطاء

### إذا لم تظهر الترجمات:
1. تحقق من تحميل ملفات الترجمة
2. تحقق من صحة بنية JSON
3. تحقق من وجود المفاتيح في الملفات
4. تحقق من إعدادات i18n

### إذا ظهرت المفاتيح بدلاً من الترجمات:
1. تحقق من وجود المفتاح في ملف الترجمة
2. تحقق من صحة كتابة المفتاح في الكود
3. تحقق من تحميل اللغة الصحيحة 