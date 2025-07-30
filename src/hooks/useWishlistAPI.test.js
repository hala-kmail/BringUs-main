// Simple test file for useWishlistAPI hook
// This is just for documentation purposes

import useWishlistAPI from './useWishlistAPI';

// Example usage and expected behavior:

/*
1. Fetch Wishlist:
   - GET /api/likes
   - Requires Authorization header with Bearer token
   - Returns array of liked products

2. Like a Product:
   - POST /api/likes/:productId
   - Requires Authorization header
   - Possible responses:
     * 200: Success
     * 400: Already liked
     * 401: Unauthorized
     * 403: Cross-store like attempt
     * 404: Product not found

3. Unlike a Product:
   - DELETE /api/likes/:productId
   - Requires Authorization header
   - Possible responses:
     * 200: Success
     * 401: Unauthorized
     * 404: Like not found

4. Clear Wishlist:
   - Multiple DELETE requests to /api/likes/:productId
   - Deletes each liked product individually

Expected API Response Format:
{
  success: true,
  data: [
    {
      _id: "like_id",
      productId: "product_id",
      userId: "user_id",
      product: {
        _id: "product_id",
        name: { ar: "اسم المنتج", en: "Product Name" },
        price: 100,
        images: [...],
        // ... other product fields
      }
    }
  ]
}
*/

export default useWishlistAPI; 