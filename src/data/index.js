
import { allProducts } from './products.js';
import { categories } from './categories.js';
import { features } from './features.js';

//-----------------------------------export------------------------------------------------  
export { allProducts, categories, features };

//-----------------------------------getMainCategories------------------------------------------------  
export const getMainCategories = () => {
  return categories.filter(category => category.parentCategoryId === null);
};

//-----------------------------------getSubCategories------------------------------------------------  
export const getSubCategories = (parentCategoryId) => {
  return categories.filter(category => category.parentCategoryId === parentCategoryId);
};

//-----------------------------------getProductsByParentCategory------------------------------------------------  
export const getProductsByParentCategory = (parentCategoryId) => {
  const getAllSubcategoryIds = (categoryId) => {
    const subcategories = getSubCategories(categoryId);
    let subcategoryIds = subcategories.map(sub => sub.id);
    
    subcategories.forEach(sub => {
      subcategoryIds = subcategoryIds.concat(getAllSubcategoryIds(sub.id));
    });
    
    return subcategoryIds;
  };
  const allSubcategoryIds = getAllSubcategoryIds(parentCategoryId);
  return allProducts.filter(product => allSubcategoryIds.includes(product.categoryId));
};


//-----------------------------------getSubCategoriesByCategoryParentId------------------------------------------------  
export const getSubCategoriesByCategoryParentId = (parentCategoryId) => {
  
  const subCategories = getSubCategories(parentCategoryId);
  
  //-----------------------------------getSubCategoriesByCategoryParentId------------------------------------------------  
  const subCategoryIds = subCategories.map(subCategory => subCategory.id);

  //-----------------------------------getSubCategoriesByCategoryParentId------------------------------------------------  
  return allProducts.filter(product => subCategoryIds.includes(product.categoryId));
};


//-----------------------------------getCategoryById------------------------------------------------  
export const getCategoryById = (categoryId) => {
  return categories.find(category => category.id === categoryId) || null;
};


//-----------------------------------getFeatureById------------------------------------------------  
export const getFeatureById = (featureId) => {
  return features.find(feature => feature.id === featureId) || null;
};

//-----------------------------------getProductById------------------------------------------------  
export const getProductById = (productId) => {
  return allProducts.find(product => product.id === productId) || null;
};

//-----------------------------------getProductsByCategory------------------------------------------------  
export const getProductsByCategory = (categoryId) => {
  return allProducts.filter(product => product.categoryId === categoryId);
};
//-----------------------------------getProductsByFeature------------------------------------------------  
export const getProductsByFeature = (featureId) => {
  return allProducts.filter(product => product.featureId === featureId);
};


//-----------------------------------getBestSellerProducts------------------------------------------------  
export const getBestSellerProducts = () => {
  return allProducts.filter(product => product.isBestSeller === true);
};

//-----------------------------------getNewProducts------------------------------------------------  
export const getNewProducts = () => {
  return allProducts.filter(product => product.isNew === true);
};

//-----------------------------------getDiscountedProducts------------------------------------------------  
export const getDiscountedProducts = () => {
  return allProducts.filter(product => product.discountPercentage !== null);
};

//-----------------------------------getProductsInStock------------------------------------------------  
export const getProductsInStock = (minStock = 1) => {
  return allProducts.filter(product => product.stock >= minStock);
};

//-----------------------------------getLowStockProducts------------------------------------------------  
export const getLowStockProducts = (threshold = 10) => {
  return allProducts.filter(product => product.stock < threshold);
};

//-----------------------------------getEnrichedProduct------------------------------------------------  
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
//-----------------------------------getEnrichedProducts------------------------------------------------  
export const getEnrichedProducts = (language = 'en') => {
  return allProducts.map(product => getEnrichedProduct(product.id, language));
};

//-----------------------------------searchProducts------------------------------------------------  
export const searchProducts = (query, language = 'en') => {
  const searchTerm = query.toLowerCase();
  return allProducts.filter(product => 
    product.name[language].toLowerCase().includes(searchTerm) ||
    product.description[language].toLowerCase().includes(searchTerm)
  );
};

//-----------------------------------getCategoryIdBySlug------------------------------------------------  
export const getCategoryIdBySlug = (slug, language = 'en') => {
  const category = categories.find(cat => cat.slug[language] === slug);
  return category ? category.id : null;
};

//-----------------------------------filterProducts------------------------------------------------  
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
      const hasDiscount = product.discountPercentage !== null;
      if (hasDiscount !== filters.hasDiscount) return false;
    }

    // Price range filter
    const effectivePrice = product.originalPrice;
    if (filters.minPrice !== undefined && effectivePrice < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && effectivePrice > filters.maxPrice) return false;

    // Stock filter
    if (filters.minStock !== undefined && product.stock < filters.minStock) return false;

    return true;
  });
};


export const getProductStatistics = () => {
  const totalProducts = allProducts.length;
  const bestSellers = getBestSellerProducts().length;
  const newProducts = getNewProducts().length;
  const discountedProducts = getDiscountedProducts().length;
  const inStockProducts = getProductsInStock().length;
  const lowStockProducts = getLowStockProducts().length;
  
  const totalStock = allProducts.reduce((sum, product) => sum + product.stock, 0);
  const averageStock = totalStock / totalProducts;
  
  const prices = allProducts.map(product =>  product.originalPrice);
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
    
    featuresCount: features.length
  };
};

//-----------------------------------export------------------------------------------------  
export default {
  allProducts,
  categories,
 
  features,
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
  getProductsByParentCategory
};