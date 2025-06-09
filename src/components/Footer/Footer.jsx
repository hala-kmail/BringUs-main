import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--background-color, #f9fafb)', color: 'var(--text-secondary, #64748b)', borderTop: '1px solid var(--primary-light, #f3f4f6)', marginTop: 48 }}>
      {/* Newsletter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 16px 16px 16px',
        gap: 24
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3 style={{ color: 'var(--primary-color, #fbbf24)', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>اشترك في النشرة البريدية</h3>
          <p style={{ margin: 0, fontSize: 15 }}>سجّل بريدك ليصلك كل جديد من العروض والخصومات. لا نرسل رسائل مزعجة!</p>
        </div>
        <form
          style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 260, flex: 1, maxWidth: 400 }}
          onSubmit={e => { e.preventDefault(); alert('تم الاشتراك بنجاح!'); }}
        >
          <input
            type="email"
            placeholder="أدخل بريدك الإلكتروني"
            required
            style={{
              padding: '10px 14px',
              border: '1px solid var(--primary-light, #fbbf24)',
              borderRadius: '8px 0 0 8px',
              outline: 'none',
              fontSize: 15,
              width: '70%',
              background: '#fff'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--primary-color, #fbbf24)',
              color: '#fff',
              border: 'none',
              borderRadius: '0 8px 8px 0',
              padding: '10px 22px',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer'
            }}
          >
            اشترك
          </button>
        </form>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 0 24px 0' }} />

      {/* Main Footer Columns */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 16px 24px 16px',
        gap: 32
      }}>
        {/* Support */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <h4 style={{ color: 'var(--primary-color, #fbbf24)', fontWeight: 700, fontSize: 17 }}>الدعم الفني</h4>
          <div style={{ fontSize: 15, margin: '8px 0' }}>لأي استفسار أو مساعدة تواصل معنا:</div>
          <div style={{ fontSize: 15, margin: '4px 0' }}>
            <i className="fas fa-phone" style={{ marginInlineEnd: 6 }}></i>
            0800-300-353
          </div>
          <div style={{ fontSize: 15 }}>
            <i className="fas fa-envelope" style={{ marginInlineEnd: 6 }}></i>
            info@bringus.com
          </div>
        </div>
        {/* Links */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <h4 style={{ color: 'var(--primary-color, #fbbf24)', fontWeight: 700, fontSize: 17 }}>روابط مهمة</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15 }}>
            <li><a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>سياسة الخصوصية</a></li>
            <li><a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>الشروط والأحكام</a></li>
            <li><a href="/help" style={{ color: 'inherit', textDecoration: 'none' }}>مركز المساعدة</a></li>
          </ul>
        </div>
        {/* About */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <h4 style={{ color: 'var(--primary-color, #fbbf24)', fontWeight: 700, fontSize: 17 }}>عن المتجر</h4>
          <div style={{ fontSize: 15, margin: '8px 0' }}>
            متجر إلكتروني تجريبي لعرض المنتجات والشراء بسهولة.
          </div>
        </div>
        {/* Social & App */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <h4 style={{ color: 'var(--primary-color, #fbbf24)', fontWeight: 700, fontSize: 17 }}>تابعنا</h4>
          <div style={{ marginBottom: 10 }}>
            <a href="https://wa.me/123456789" target="_blank" rel="noopener noreferrer" style={{ margin: '0 6px', color: 'var(--primary-color, #fbbf24)', fontSize: 22 }}>
              <i className="fab fa-whatsapp"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 6px', color: 'var(--primary-color, #fbbf24)', fontSize: 22 }}>
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 6px', color: 'var(--primary-color, #fbbf24)', fontSize: 22 }}>
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 6px', color: 'var(--primary-color, #fbbf24)', fontSize: 22 }}>
              <i className="fab fa-twitter"></i>
            </a>
          </div>
          <div style={{ fontSize: 14, color: '#aaa' }}>تطبيقاتنا قريبًا</div>
        </div>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 0 12px 0' }} />
      {/* Bottom Bar */}
      <div style={{ textAlign: 'center', fontSize: 14, color: '#888', padding: '0 0 18px 0' }}>
        &copy; {currentYear} BringUs. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
};

export default Footer; 

