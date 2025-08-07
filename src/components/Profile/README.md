# User Orders System

نظام إدارة طلبات المستخدم في صفحة البروفايل

## المكونات

### 1. `useUserOrders` Hook
**الملف:** `src/hooks/useUserOrders.js`

Hook مخصص لإدارة طلبات المستخدم مع API.

**الدوال المتاحة:**
- `getUserOrders(page, limit, status)` - جلب طلبات المستخدم
- `getOrderDetails(orderId)` - جلب تفاصيل طلب محدد
- `cancelOrder(orderId, reason)` - إلغاء طلب
- `updateOrderStatus(orderId, status, notes)` - تحديث حالة الطلب

**الحالة المُدارة:**
- `orders` - قائمة الطلبات
- `loading` - حالة التحميل
- `error` - رسائل الخطأ
- `pagination` - معلومات الصفحات

### 2. `UserOrders` Component
**الملف:** `src/components/Profile/UserOrders.jsx`

مكون رئيسي لعرض وإدارة طلبات المستخدم.

**الميزات:**
- عرض قائمة الطلبات مع التصفية حسب الحالة
- عرض تفاصيل الطلب في نافذة منبثقة
- إمكانية إلغاء الطلبات
- التنقل بين الصفحات
- دعم اللغتين العربية والإنجليزية
- تصميم متجاوب

## كيفية الاستخدام

### في صفحة البروفايل

```javascript
import UserOrders from '../../components/Profile/UserOrders';

// في مكون البروفايل
{activeTab === 'orders' && (
  <div className="profile-tab">
    <UserOrders />
  </div>
)}
```

### استخدام Hook مباشرة

```javascript
import useUserOrders from '../../hooks/useUserOrders';

const MyComponent = () => {
  const {
    orders,
    loading,
    error,
    pagination,
    getUserOrders,
    getOrderDetails,
    cancelOrder
  } = useUserOrders();

  useEffect(() => {
    // جلب الطلبات عند تحميل المكون
    getUserOrders(1, 10);
  }, []);

  return (
    <div>
      {loading && <p>جاري التحميل...</p>}
      {error && <p>خطأ: {error}</p>}
      {orders.map(order => (
        <div key={order.orderNumber}>
          <h3>طلب #{order.orderNumber}</h3>
          <p>الحالة: {order.status}</p>
          <p>المجموع: {order.price}</p>
        </div>
      ))}
    </div>
  );
};
```

## API Endpoints

### جلب طلبات المستخدم
```
GET /api/orders/my-orders
Headers: Authorization: Bearer <token>
Query Parameters:
  - page (number): رقم الصفحة
  - limit (number): عدد العناصر في الصفحة
  - status (string): حالة الطلب (اختياري)
```

### جلب تفاصيل طلب محدد
```
GET /api/orders/my-orders/:orderId
Headers: Authorization: Bearer <token>
```

### إلغاء طلب
```
PUT /api/orders/:orderId/cancel
Headers: Authorization: Bearer <token>
Body: {
  "reason": "سبب الإلغاء (اختياري)"
}
```

## هيكل البيانات

### Order Object
```javascript
{
  orderNumber: "ORD-123456",
  date: "2024-01-15T10:30:00Z",
  status: "pending", // pending, confirmed, processing, shipped, delivered, cancelled, refunded
  paymentStatus: "paid", // paid, unpaid
  price: 150.00,
  currency: "SAR",
  itemsCount: 3,
  items: [
    {
      productId: "prod-123",
      name: "اسم المنتج",
      image: "https://example.com/image.jpg",
      quantity: 2,
      pricePerUnit: 25.00,
      total: 50.00,
      selectedSpecifications: [...],
      selectedColors: [...]
    }
  ],
  pricing: {
    subtotal: 100.00,
    tax: 10.00,
    shipping: 20.00,
    discount: 0.00,
    total: 130.00
  },
  shippingAddress: {...},
  billingAddress: {...},
  paymentInfo: {...},
  shippingInfo: {...}
}
```

## حالات الطلب

| الحالة | الوصف |
|--------|-------|
| `pending` | قيد المراجعة |
| `confirmed` | مؤكد |
| `processing` | قيد المعالجة |
| `shipped` | تم الشحن |
| `delivered` | تم التوصيل |
| `cancelled` | ملغي |
| `refunded` | مسترد |

## التصميم

### الألوان
- **الأزرق الأساسي:** `var(--primary-color)`
- **الأحمر للإلغاء:** `#ef4444`
- **الرمادي للتعطيل:** `#6b7280`

### الحالات
- **تحميل:** Spinner مع رسالة
- **خطأ:** رسالة خطأ مع زر إعادة المحاولة
- **لا توجد طلبات:** رسالة مع زر البدء في التسوق
- **قائمة الطلبات:** بطاقات مع معلومات ملخصة

### التجاوب
- **Desktop:** عرض أفقي للبطاقات
- **Mobile:** عرض عمودي مع أزرار كاملة العرض

## الترجمات

### العربية
```json
{
  "profile": {
    "my_orders": "طلباتي",
    "order_details": "تفاصيل الطلب",
    "view_details": "عرض التفاصيل",
    "cancel_order": "إلغاء الطلب",
    "no_orders_found": "لا توجد طلبات"
  }
}
```

### الإنجليزية
```json
{
  "profile": {
    "my_orders": "My Orders",
    "order_details": "Order Details",
    "view_details": "View Details",
    "cancel_order": "Cancel Order",
    "no_orders_found": "No Orders Found"
  }
}
```

## الملفات المطلوبة

1. **`src/hooks/useUserOrders.js`** - Hook لإدارة الطلبات
2. **`src/components/Profile/UserOrders.jsx`** - مكون عرض الطلبات
3. **`src/components/Profile/UserOrders.css`** - أنماط المكون
4. **`src/utils/currencyUtils.js`** - دوال تنسيق العملة
5. **`src/utils/tokenManager.js`** - إدارة التوكن

## ملاحظات مهمة

1. **المصادقة:** يجب أن يكون المستخدم مسجل الدخول
2. **التوكن:** يتم إرسال توكن المصادقة في header
3. **الأخطاء:** يتم التعامل مع الأخطاء وعرض رسائل مناسبة
4. **التحديث:** يتم تحديث القائمة تلقائياً بعد الإلغاء
5. **التصميم:** يدعم RTL للغة العربية

## الاختبار

```javascript
// اختبار جلب الطلبات
const { getUserOrders } = useUserOrders();
await getUserOrders(1, 10, 'pending');

// اختبار إلغاء طلب
const { cancelOrder } = useUserOrders();
await cancelOrder('ORD-123456', 'غيرت رأيي');

// اختبار جلب التفاصيل
const { getOrderDetails } = useUserOrders();
const details = await getOrderDetails('ORD-123456');
``` 