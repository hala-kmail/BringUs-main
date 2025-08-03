
import { allProducts } from './products.js';
import namer from 'color-namer';

//-----------------------------------export------------------------------------------------  
export { allProducts };

//-----------------------------------getMaxProductPrice------------------------------------------------  
export const getMaxProductPrice = () => {
  return Math.max(
    ...allProducts.map(p => p.originalPrice+1 || 0)
  );
};

//----------------------------------getColorKey------------------------------------------------ 
export const getColorKey = (hex) => {
  if (!hex) return '';
  if (hex === 'mixed') return 'mixed';
  try {
    return namer(hex).ntc[0].name.toLowerCase();
  } catch {
    return hex;
  }
}

//----------------------------------getColorLabel------------------------------------------------ 
export const getColorLabel = (hex, t) => {
  const colorKey = getColorKey(hex);
  const translation = t(`filters.color_names.${colorKey}`);
  if (!translation || translation === `filters.color_names.${colorKey}`) {
    if (colorKey && colorKey !== hex) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
    return hex;
  }
  return translation;
}

//----------------------------------getAllColors------------------------------------------------ 
export const getAllColors = () => {
  const colorSet = new Set();
  allProducts.forEach(product => {
    if (product.colors && Array.isArray(product.colors)) {
      product.colors.forEach(color => colorSet.add(color));
    }
  });
  return Array.from(colorSet);
}

//-----------------------------------getMainCategories------------------------------------------------  
export const getMainCategories = (categories = []) => {
  return categories.filter(category => !category.parentCategoryId);
};

//-----------------------------------getSubCategories------------------------------------------------  
export const getSubCategories = (parentCategoryId, categories = []) => {
  return categories.filter(category => category.parentCategoryId === parentCategoryId);
};

//-----------------------------------getProductsByParentCategory------------------------------------------------  
export const getProductsByParentCategory = (parentCategoryId, products = [], categories = []) => {
  const getAllSubcategoryIds = (categoryId) => {
    const subcategories = getSubCategories(categoryId, categories);
    let subcategoryIds = subcategories.map(sub => sub._id);
    
    subcategories.forEach(sub => {
      subcategoryIds = subcategoryIds.concat(getAllSubcategoryIds(sub._id));
    });
    
    return subcategoryIds;
  };
  const allSubcategoryIds = getAllSubcategoryIds(parentCategoryId);
  return products.filter(product => allSubcategoryIds.includes(product.categoryId));
};

//-----------------------------------getSubCategoriesByCategoryParentId------------------------------------------------  
export const getSubCategoriesByCategoryParentId = (parentCategoryId, products = [], categories = []) => {
  const subCategories = getSubCategories(parentCategoryId, categories);
  const subCategoryIds = subCategories.map(subCategory => subCategory._id);
  return products.filter(product => subCategoryIds.includes(product.categoryId));
};

//-----------------------------------getCategoryById------------------------------------------------  
export const getCategoryById = (categoryId, categories = []) => {
  return categories.find(category => category._id === categoryId) || null;
};

//-----------------------------------getFeatureById------------------------------------------------  
export const getFeatureById = (featureId, features = []) => {
  return features.find(feature => feature._id === featureId) || null;
};

//-----------------------------------getProductById------------------------------------------------  
export const getProductById = (productId, products = []) => {
  return products.find(product => product._id === productId) || null;
};

//-----------------------------------getProductsByCategory------------------------------------------------  
export const getProductsByCategory = (categoryId, products = []) => {
  return products.filter(product => product.categoryId === categoryId);
};

//-----------------------------------getProductsByFeature------------------------------------------------  
export const getProductsByFeature = (featureId, products = []) => {
  return products.filter(product => product.featureId === featureId);
};

//-----------------------------------getBestSellerProducts------------------------------------------------  
export const getBestSellerProducts = (products = []) => {
  return products.filter(product => product.isBestSeller === true);
};

//-----------------------------------getNewProducts------------------------------------------------  
export const getNewProducts = (products = []) => {
  return products.filter(product => product.isNew === true);
};

//-----------------------------------getDiscountedProducts------------------------------------------------  
export const getDiscountedProducts = (products = []) => {
  return products.filter(product => product.discountPercentage !== null);
};

//-----------------------------------getProductsInStock------------------------------------------------  
export const getProductsInStock = (products = [], minStock = 1) => {
  return products.filter(product => product.stock >= minStock);
};

//-----------------------------------getLowStockProducts------------------------------------------------  
export const getLowStockProducts = (products = [], threshold = 10) => {
  return products.filter(product => product.stock < threshold);
};

//-----------------------------------getEnrichedProduct------------------------------------------------  
export const getEnrichedProduct = (productId, products = [], categories = [], features = [], language = 'en') => {
  const product = getProductById(productId, products);
  if (!product) return null;

  const category = getCategoryById(product.categoryId, categories);
  const feature = getFeatureById(product.featureId, features);

  return {
    ...product,
    categoryName: category ? (category.nameAr || category.nameEn) : null,
    featureName: feature ? (feature.nameAr || feature.nameEn) : null,
    displayName: product.nameAr || product.nameEn,
    displayDescription: product.descriptionAr || product.descriptionEn
  };
};

//-----------------------------------getEnrichedProducts------------------------------------------------  
export const getEnrichedProducts = (products = [], categories = [], features = [], language = 'en') => {
  return products.map(product => getEnrichedProduct(product._id, products, categories, features, language));
};

//-----------------------------------searchProducts------------------------------------------------  
export const searchProducts = (query, products = [], language = 'en') => {
  const searchTerm = query.toLowerCase();
  return products.filter(product => {
    const name = (product.nameAr || product.nameEn || '').toLowerCase();
    const description = (product.descriptionAr || product.descriptionEn || '').toLowerCase();
    return name.includes(searchTerm) || description.includes(searchTerm);
  });
};

//-----------------------------------getCategoryIdBySlug------------------------------------------------  
export const getCategoryIdBySlug = (slug, categories = [], language = 'en') => {
  const category = categories.find(cat => {
    const categorySlug = language === 'ar' ? cat.slugAr : cat.slugEn;
    return categorySlug === slug;
  });
  return category ? category._id : null;
};

//-----------------------------------filterProducts------------------------------------------------  
export const filterProducts = (filters = {}, products = []) => {
  return products.filter(product => {
    // Category filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      if (!filters.categoryIds.includes(product.categoryId)) return false;
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
      const hasDiscount = product.discountPercentage !== null;
      if (hasDiscount !== filters.hasDiscount) return false;
    }

    // Price range filter
    const effectivePrice = product.originalPrice || product.price;
    if (filters.minPrice !== undefined && effectivePrice < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && effectivePrice > filters.maxPrice) return false;

    // Stock filter
    if (filters.minStock !== undefined && product.stock < filters.minStock) return false;

    return true;
  });
};

export const getProductStatistics = (products = [], categories = [], features = []) => {
  const totalProducts = products.length;
  const bestSellers = getBestSellerProducts(products).length;
  const newProducts = getNewProducts(products).length;
  const discountedProducts = getDiscountedProducts(products).length;
  const inStockProducts = getProductsInStock(products).length;
  const lowStockProducts = getLowStockProducts(products).length;
  
  const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
  const averageStock = totalProducts > 0 ? totalStock / totalProducts : 0;
  
  const prices = products.map(product => product.originalPrice || product.price || 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const averagePrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;

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
    featuresCount: features.length
  };
};

//-----------------------------------export------------------------------------------------  
export default {
  allProducts,
  getMaxProductPrice, 
  getMainCategories,
  getSubCategories,
  getSubCategoriesByCategoryParentId,
  getCategoryById,
  getFeatureById,
  getProductById,
  getProductsByCategory,
  getProductsByFeature,
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
  getProductsByParentCategory,
  getColorKey,
  getColorLabel,
  getAllColors
};