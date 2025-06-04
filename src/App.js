import { useNavigate, useLocation } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <Routes>
        {/* ... existing code ... */}
      </Routes>
      {/* تم حذف الزر العائم بناءً على طلب المستخدم */}
    </>
  );
}

export default App; 
