import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5001/api';

const useAlmostSoldProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlmostSoldProducts = useCallback(async (storeId) => {
    if (!storeId) return;

    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/products/${storeId}/almost-sold`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setProducts(result.data);
        console.log('Almost sold products loaded:', result.data);
        return result.data;
      } else {
        console.log('No almost sold products found');
        setProducts([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching almost sold products:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchAlmostSoldProducts
  };
};

export default useAlmostSoldProducts;
