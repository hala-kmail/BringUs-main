/**
 * Data access layer for the improved relational data structure
 */
import { allProducts } from './products.js';
import { categories } from './categories.js';
import { subcategories } from './subcategories.js';
import { features } from './features.js';

// Export all data entities
export { allProducts, categories, subcategories, features };

// Helper functions for data relationships and queries
export const getMainCategories = () => {
  return categories.filter(category => category.parentCategoryId === null);
};


export const getSubCategories = (parentCategoryId) => {
  return categories.filter(category => category.parentCategoryId === parentCategoryId);
};

export const getProductsByParentCategory = (parentCategoryId) => {
  // Helper function to recursively get all subcategory IDs
  const getAllSubcategoryIds = (categoryId) => {
    const subcategories = getSubCategories(categoryId);
    let subcategoryIds = subcategories.map(sub => sub.id);
    
    // Recursively get IDs of subcategories' descendants
    subcategories.forEach(sub => {
      subcategoryIds = subcategoryIds.concat(getAllSubcategoryIds(sub.id));
    });
    
    return subcategoryIds;
  };

  // Get all subcategory IDs under the parentCategoryId
  const allSubcategoryIds = getAllSubcategoryIds(parentCategoryId);

  // Filter products whose categoryId is in the list of subcategory IDs
  return allProducts.filter(product => allSubcategoryIds.includes(product.categoryId));
};


export const getSubCategoriesByCategoryParentId = (parentCategoryId) => {
  
  const subCategories = getSubCategories(parentCategoryId);
  
  const subCategoryIds = subCategories.map(subCategory => subCategory.id);

  return allProducts.filter(product => subCategoryIds.includes(product.categoryId));
};


/**
 * Get category by ID
 */
export const getCategoryById = (categoryId) => {
  return categories.find(category => category.id === categoryId) || null;
};


/**
 * Get feature by ID
 * @param {number} featureId - The feature ID
 * @returns {Object|null} Feature object or null if not found
 */
export const getFeatureById = (featureId) => {
  return features.find(feature => feature.id === featureId) || null;
};

/**
 * Get product by ID
 * @param {number} productId - The product ID
 * @returns {Object|null} Product object or null if not found
 */
export const getProductById = (productId) => {
  return allProducts.find(product => product.id === productId) || null;
};

/**
 * Get products by category ID
 * @param {number} categoryId - The category ID
 * @returns {Array} Array of products in the category
 */
export const getProductsByCategory = (categoryId) => {
  return allProducts.filter(product => product.categoryId === categoryId);
};

/**
 * Get products by subcategory ID
 * @param {number} subcategoryId - The subcategory ID
 * @returns {Array} Array of products in the subcategory
 */
export const getProductsBySubcategory = (subcategoryId) => {
  return allProducts.filter(product => product.categoryId === subcategoryId);
};

/**
 * Get products by feature ID
 * @param {number} featureId - The feature ID
 * @returns {Array} Array of products with the feature
 */
export const getProductsByFeature = (featureId) => {
  return allProducts.filter(product => product.featureId === featureId);
};

/**
 * Get subcategories by category ID
 * @param {number} categoryId - The category ID
 * @returns {Array} Array of subcategories in the category
 */
export const getSubcategoriesByCategory = (categoryId) => {
  return subcategories.filter(subcategory => subcategory.categoryId === categoryId);
};

/**
 * Get best seller products
 * @returns {Array} Array of best seller products
 */
export const getBestSellerProducts = () => {
  return allProducts.filter(product => product.isBestSeller === true);
};

/**
 * Get new products
 * @returns {Array} Array of new products
 */
export const getNewProducts = () => {
  return allProducts.filter(product => product.isNew === true);
};

/**
 * Get products with discounts
 * @returns {Array} Array of products that have discounts
 */
export const getDiscountedProducts = () => {
  return allProducts.filter(product => product.discountPrice !== null);
};

/**
 * Get products in stock
 * @param {number} minStock - Minimum stock level (default: 1)
 * @returns {Array} Array of products with stock above minimum level
 */
export const getProductsInStock = (minStock = 1) => {
  return allProducts.filter(product => product.stock >= minStock);
};

/**
 * Get products with low stock
 * @param {number} threshold - Stock threshold (default: 10)
 * @returns {Array} Array of products with stock below threshold
 */
export const getLowStockProducts = (threshold = 10) => {
  return allProducts.filter(product => product.stock < threshold);
};

/**
 * Get enriched product with related data
 * @param {number} productId - The product ID
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {Object|null} Enriched product object or null if not found
 */
export const getEnrichedProduct = (productId, language = 'en') => {
  const product = getProductById(productId);
  if (!product) return null;

  const category = getCategoryById(product.categoryId);
  const subcategory = getSubcategoryById(product.subcategoryId);
  const feature = getFeatureById(product.featureId);

  return {
    ...product,
    categoryName: category ? category.name[language] : null,
    subcategoryName: subcategory ? subcategory.name[language] : null,
    featureName: feature ? feature.name[language] : null,
    displayName: product.name[language],
    displayDescription: product.description[language]
  };
};

/**
 * Get enriched products with related data
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {Array} Array of enriched product objects
 */
export const getEnrichedProducts = (language = 'en') => {
  return allProducts.map(product => getEnrichedProduct(product.id, language));
};

/**
 * Search products by name
 * @param {string} query - Search query
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {Array} Array of matching products
 */
export const searchProducts = (query, language = 'en') => {
  const searchTerm = query.toLowerCase();
  return allProducts.filter(product => 
    product.name[language].toLowerCase().includes(searchTerm) ||
    product.description[language].toLowerCase().includes(searchTerm)
  );
};

/**
 * Get category ID by slug
 * @param {string} slug - The category slug
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {number|null} Category ID or null if not found
 */
export const getCategoryIdBySlug = (slug, language = 'en') => {
  const category = categories.find(cat => cat.slug[language] === slug);
  return category ? category.id : null;
};

/**
 * Get subcategory ID by slug
 * @param {string} slug - The subcategory slug
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {number|null} Subcategory ID or null if not found
 */
// export const getSubcategoryIdBySlug = (slug, language = 'en') => {
//   const subcategory = categories.find(sub => sub.slug[language] === slug);
//   return subcategory ? subcategory.id : null;
// };

/**
 * Filter products by multiple criteria
 * @param {Object} filters - Filter criteria
 * @param {number[]} filters.categoryIds - Array of category IDs
 * @param {number[]} filters.subcategoryIds - Array of subcategory IDs
 * @param {number[]} filters.featureIds - Array of feature IDs
 * @param {boolean} filters.isBestSeller - Filter by best seller status
 * @param {boolean} filters.isNew - Filter by new status
 * @param {boolean} filters.hasDiscount - Filter by discount availability
 * @param {number} filters.minPrice - Minimum price
 * @param {number} filters.maxPrice - Maximum price
 * @param {number} filters.minStock - Minimum stock level
 * @returns {Array} Array of filtered products
 */
export const filterProducts = (filters = {}) => {
  return allProducts.filter(product => {
    // Category filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      if (!filters.categoryIds.includes(product.categoryId)) return false;
    }

    // Subcategory filter
    if (filters.subcategoryIds && filters.subcategoryIds.length > 0) {
      if (!filters.subcategoryIds.includes(product.subcategoryId)) return false;
    }

    // Feature filter
    if (filters.featureIds && filters.featureIds.length > 0) {
      if (!filters.featureIds.includes(product.featureId)) return false;
    }

    // Best seller filter
    if (filters.isBestSeller !== undefined) {
      if (product.isBestSeller !== filters.isBestSeller) return false;
    }

    // New product filter
    if (filters.isNew !== undefined) {
      if (product.isNew !== filters.isNew) return false;
    }

    // Discount filter
    if (filters.hasDiscount !== undefined) {
      const hasDiscount = product.discountPrice !== null;
      if (hasDiscount !== filters.hasDiscount) return false;
    }

    // Price range filter
    const effectivePrice = product.discountPrice || product.originalPrice;
    if (filters.minPrice !== undefined && effectivePrice < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && effectivePrice > filters.maxPrice) return false;

    // Stock filter
    if (filters.minStock !== undefined && product.stock < filters.minStock) return false;

    return true;
  });
};

/**
 * Get product statistics
 * @returns {Object} Statistics about the product catalog
 */
export const getProductStatistics = () => {
  const totalProducts = allProducts.length;
  const bestSellers = getBestSellerProducts().length;
  const newProducts = getNewProducts().length;
  const discountedProducts = getDiscountedProducts().length;
  const inStockProducts = getProductsInStock().length;
  const lowStockProducts = getLowStockProducts().length;
  
  const totalStock = allProducts.reduce((sum, product) => sum + product.stock, 0);
  const averageStock = totalStock / totalProducts;
  
  const prices = allProducts.map(product => product.discountPrice || product.originalPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  return {
    totalProducts,
    bestSellers,
    newProducts,
    discountedProducts,
    inStockProducts,
    lowStockProducts,
    totalStock,
    averageStock: Math.round(averageStock),
    minPrice,
    maxPrice,
    averagePrice: Math.round(averagePrice * 100) / 100,
    categoriesCount: categories.length,
    subcategoriesCount: subcategories.length,
    featuresCount: features.length
  };
};

// Default export for convenience
export default {
  allProducts,
  categories,
  subcategories,
  features,
  getMainCategories,
  getSubCategories,
  getSubCategoriesByCategoryParentId,
  getCategoryById,
  getFeatureById,
  getProductById,
  getProductsByCategory,
  getProductsBySubcategory,
  getProductsByFeature,
  getSubcategoriesByCategory,
  getBestSellerProducts,
  getNewProducts,
  getDiscountedProducts,
  getProductsInStock,
  getLowStockProducts,
  getEnrichedProduct,
  getEnrichedProducts,
  searchProducts,
  filterProducts,
  getProductStatistics,
  getCategoryIdBySlug,
  getProductsByParentCategory
};