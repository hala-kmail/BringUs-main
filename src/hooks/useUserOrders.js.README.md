# useUserOrders Hook - Updated

Hook مخصص لإدارة طلبات المستخدم مع API - محدث ليدعم إلغاء الطلبات

## التحديثات الجديدة

### 1. إلغاء الطلبات (Cancel Orders)
- **التغيير:** تم تعديل دالة `cancelOrder` لتستخدم `updateOrderStatus` بدلاً من حذف الطلب
- **النتيجة:** الطلب يتم تحديث حالته إلى "cancelled" بدلاً من حذفه من قاعدة البيانات
- **المزايا:** 
  - الحفاظ على سجل الطلبات
  - إمكانية تتبع الطلبات الملغية
  - تحسين تجربة المستخدم

## الدوال المتاحة

### `getUserOrders(page, limit, status)`
جلب طلبات المستخدم مع التصفية والتصفح

**المعاملات:**
- `page` (number): رقم الصفحة (افتراضي: 1)
- `limit` (number): عدد العناصر في الصفحة (افتراضي: 10)
- `status` (string): حالة الطلب للتصفية (اختياري)

**الاستخدام:**
```javascript
const { getUserOrders } = useUserOrders();
await getUserOrders(1, 10, 'pending');
```

### `getOrderDetails(orderId)`
جلب تفاصيل طلب محدد

**المعاملات:**
- `orderId` (string): معرف الطلب

**الاستخدام:**
```javascript
const { getOrderDetails } = useUserOrders();
const orderDetails = await getOrderDetails('ORD-123456');
```

### `cancelOrder(orderId, reason)` ⭐ **محدث**
إلغاء طلب (تحديث الحالة إلى "cancelled")

**المعاملات:**
- `orderId` (string): معرف الطلب
- `reason` (string): سبب الإلغاء (اختياري)

**الاستخدام:**
```javascript
const { cancelOrder } = useUserOrders();
await cancelOrder('ORD-123456', 'غيرت رأيي');
```

**التغييرات:**
- يستخدم `updateOrderStatus` داخلياً
- يحدث حالة الطلب إلى "cancelled"
- يحافظ على الطلب في قاعدة البيانات

### `updateOrderStatus(orderId, status, notes)`
تحديث حالة الطلب

**المعاملات:**
- `orderId` (string): معرف الطلب
- `status` (string): الحالة الجديدة
- `notes` (string): ملاحظات إضافية (اختياري)

**الاستخدام:**
```javascript
const { updateOrderStatus } = useUserOrders();
await updateOrderStatus('ORD-123456', 'cancelled', 'طلب العميل');
```

## الحالة المُدارة

```javascript
const {
  orders,           // قائمة الطلبات
  loading,          // حالة التحميل
  error,            // رسائل الخطأ
  pagination,       // معلومات الصفحات
  getUserOrders,    // دالة جلب الطلبات
  getOrderDetails,  // دالة جلب التفاصيل
  cancelOrder,      // دالة إلغاء الطلب (محدثة)
  updateOrderStatus, // دالة تحديث الحالة
  reset             // دالة إعادة تعيين الحالة
} = useUserOrders();
```

## حالات الطلب المدعومة

| الحالة | الوصف | يمكن إلغاؤه |
|--------|-------|-------------|
| `pending` | قيد المراجعة | ✅ نعم |
| `confirmed` | مؤكد | ✅ نعم |
| `processing` | قيد المعالجة | ❌ لا |
| `shipped` | تم الشحن | ❌ لا |
| `delivered` | تم التوصيل | ❌ لا |
| `cancelled` | ملغي | ❌ لا |
| `refunded` | مسترد | ❌ لا |

## مثال الاستخدام

```javascript
import useUserOrders from '../hooks/useUserOrders';

const MyComponent = () => {
  const {
    orders,
    loading,
    error,
    cancelOrder,
    getUserOrders
  } = useUserOrders();

  useEffect(() => {
    // جلب الطلبات عند تحميل المكون
    getUserOrders(1, 10);
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId, 'غيرت رأيي');
      console.log('تم إلغاء الطلب بنجاح');
    } catch (error) {
      console.error('خطأ في إلغاء الطلب:', error);
    }
  };

  return (
    <div>
      {loading && <p>جاري التحميل...</p>}
      {error && <p>خطأ: {error}</p>}
      {orders.map(order => (
        <div key={order.orderNumber}>
          <h3>طلب #{order.orderNumber}</h3>
          <p>الحالة: {order.status}</p>
          {['pending', 'confirmed'].includes(order.status) && (
            <button onClick={() => handleCancelOrder(order.orderNumber)}>
              إلغاء الطلب
            </button>
          )}
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

### تحديث حالة الطلب (يستخدم للإلغاء)
```
PUT /api/orders/:orderId/status
Headers: Authorization: Bearer <token>
Body: {
  "status": "cancelled",
  "notes": "سبب الإلغاء (اختياري)"
}
```

## معالجة الأخطاء

```javascript
try {
  await cancelOrder('ORD-123456', 'غيرت رأيي');
  // نجح الإلغاء
} catch (error) {
  // فشل الإلغاء
  console.error('خطأ في إلغاء الطلب:', error.message);
  
  // رسائل الخطأ المحتملة:
  // - "No authentication token found"
  // - "Failed to update order status"
  // - "Order not found"
  // - "Cannot cancel order in current status"
}
```

## التحديثات التلقائية

بعد إلغاء الطلب:
1. يتم تحديث حالة الطلب في قاعدة البيانات
2. يتم إعادة جلب قائمة الطلبات تلقائياً
3. يتم عرض الطلب المحدث مع الحالة الجديدة "cancelled"

## ملاحظات مهمة

1. **الأمان:** يتم التحقق من التوكن في كل طلب
2. **التحديث:** يتم تحديث القائمة تلقائياً بعد الإلغاء
3. **الحالات:** يمكن إلغاء الطلبات في حالة "pending" أو "confirmed" فقط
4. **السجل:** الطلبات الملغية تبقى في قاعدة البيانات مع حالة "cancelled"
5. **التتبع:** يمكن تتبع الطلبات الملغية في قسم "ملغي" في الفلاتر

## الاختبار

```javascript
// اختبار إلغاء طلب
test('should cancel order successfully', async () => {
  const { cancelOrder } = useUserOrders();
  const result = await cancelOrder('ORD-123456', 'غيرت رأيي');
  expect(result.success).toBe(true);
});

// اختبار عدم إمكانية إلغاء طلب مكتمل
test('should not cancel completed order', async () => {
  const { cancelOrder } = useUserOrders();
  await expect(cancelOrder('ORD-123456')).rejects.toThrow();
});
``` 