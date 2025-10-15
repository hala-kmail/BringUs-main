/**
 * Utility functions for category operations
 */

/**
 * Check if a product belongs to any of the specified category IDs
 * Supports products with both single category and multiple categories
 * 
 * @param {Object} product - The product object
 * @param {Array|string} categoryIds - Single category ID or array of category IDs to check
 * @returns {boolean} - True if product belongs to any of the categories
 */
export const productBelongsToCategories = (product, categoryIds) => {
  if (!product || !categoryIds) return false;

  // Normalize categoryIds to array
  const targetCategoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  
  // Check multi-category products (categories array - plural)
  if (product.categories && Array.isArray(product.categories)) {
    return product.categories.some(cat => {
      const catId = cat._id || cat.id;
      return targetCategoryIds.includes(catId);
    });
  }
  
  // Check single-category products (category field - singular)
  if (product.category) {
    const productCategoryId = product.category._id || product.category.id;
    return targetCategoryIds.includes(productCategoryId);
  }
  
  return false;
};

/**
 * Get all category IDs from a product (supports both single and multi-category)
 * 
 * @param {Object} product - The product object
 * @returns {Array} - Array of category IDs the product belongs to
 */
export const getProductCategoryIds = (product) => {
  if (!product) return [];

  const categoryIds = [];

  // Check multi-category products (categories array - plural)
  if (product.categories && Array.isArray(product.categories)) {
    product.categories.forEach(cat => {
      const catId = cat._id || cat.id;
      if (catId) {
        categoryIds.push(catId);
      }
    });
  }
  
  // Check single-category products (category field - singular)
  if (product.category) {
    const productCategoryId = product.category._id || product.category.id;
    if (productCategoryId && !categoryIds.includes(productCategoryId)) {
      categoryIds.push(productCategoryId);
    }
  }
  
  return categoryIds;
};

/**
 * Filter products by category IDs (supports multi-category products and subcategories)
 * 
 * @param {Array} products - Array of products to filter
 * @param {Array|string} categoryIds - Category ID(s) to filter by
 * @returns {Array} - Filtered products
 */
export const filterProductsByCategories = (products, categoryIds) => {
  if (!products || !Array.isArray(products) || !categoryIds) {
    return [];
  }

  return products.filter(product => 
    productBelongsToCategories(product, categoryIds)
  );
};

/**
 * Get all descendant category IDs (including the parent and all nested subcategories)
 * 
 * @param {string} categoryId - The parent category ID
 * @param {Array} allCategories - All categories in the system
 * @returns {Array} - Array of category IDs (parent + all descendants)
 */
export const getAllDescendantCategoryIds = (categoryId, allCategories) => {
  if (!categoryId || !allCategories) return [categoryId];

  const descendantIds = [categoryId];
  
  const getSubCategories = (parentId) => {
    return allCategories.filter(cat => {
      const parentCatId = cat.parent?._id || cat.parent?.id || cat.parentId;
      return parentCatId === parentId;
    });
  };

  const processCategory = (catId) => {
    const subCats = getSubCategories(catId);
    subCats.forEach(subCat => {
      const subCatId = subCat._id || subCat.id;
      if (!descendantIds.includes(subCatId)) {
        descendantIds.push(subCatId);
        // Recursively process nested subcategories
        processCategory(subCatId);
      }
    });
  };

  processCategory(categoryId);
  
  return descendantIds;
};

