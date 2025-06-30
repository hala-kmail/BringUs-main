# Improved Data Structure Documentation

## Overview

The data structure has been completely restructured to be more organized, scalable, and API-ready. The new architecture separates concerns into independent entities with proper relationships, making it suitable for both relational databases (PostgreSQL) and NoSQL databases (MongoDB).

## Data Entities

### 1. Categories (`categories.js`)
Main product categories with multilingual support.

```javascript
{
  id: 1,
  name: {
    en: "Fruits & Vegetables",
    ar: "الفواكه والخضروات"
  }
}
```

### 2. Subcategories (`subcategories.js`)
Subcategories linked to main categories.

```javascript
{
  id: 1,
  name: {
    en: "Fruits",
    ar: "الفواكه"
  },
  categoryId: 1  // References categories.id
}
```

### 3. Features (`features.js`)
Product features/attributes with multilingual support.

```javascript
{
  id: 1,
  name: {
    en: "Organic",
    ar: "عضوي"
  }
}
```

### 4. Products (`products_new.js`)
Enhanced product structure with references to other entities.

```javascript
{
  id: 1,
  image: "https://...",
  name: {
    en: "Fresh Organic Apples",
    ar: "تفاح عضوي طازج"
  },
  description: {
    en: "Freshly picked organic apples...",
    ar: "تفاح عضوي طازج..."
  },
  originalPrice: 25.99,
  
  discountPercentage: 23,
  featureId: 1,           // References features.id
  colors: ["Red", "Green"],
  categoryId: 1,          // References categories.id
  subcategoryId: 1,       // References subcategories.id
  stock: 100,
  isBestSeller: true,
  isNew: false,
  createdAt: "2025-05-28T00:00:00Z",
  updatedAt: "2025-05-28T00:00:00Z"
}
```

## Key Improvements

### 1. **Normalized Structure**
- Separated categories, subcategories, and features into independent entities
- Eliminated data duplication
- Used foreign key references (IDs) instead of embedded objects

### 2. **Enhanced Product Schema**
- Added `description` field with multilingual support
- Added `stock` field for inventory tracking
- Added `createdAt` and `updatedAt` timestamps
- Maintained `isBestSeller` and `isNew` flags

### 3. **API-Ready Design**
- Compatible with REST API patterns
- Suitable for GraphQL schemas
- Ready for database integration (SQL or NoSQL)

### 4. **Multilingual Support**
- All text fields support English and Arabic
- Consistent language structure across all entities

## Data Access Layer (`index.js`)

The data access layer provides comprehensive helper functions for working with the relational data:

### Basic Entity Getters
```javascript
import dataLayer from './data/index.js';

// Get entities by ID
const category = dataLayer.getCategoryById(1);

const feature = dataLayer.getFeatureById(1);
const product = dataLayer.getProductById(1);
```

### Relationship Queries
```javascript
// Get products by relationships
const fruitsProducts = dataLayer.getProductsByCategory(1);
const organicProducts = dataLayer.getProductsByFeature(1);
const subcategoryProducts = dataLayer.getProductsBySubcategory(1);

// Get subcategories by category
const fruitSubcategories = dataLayer.getSubcategoriesByCategory(1);
```

### Special Queries
```javascript
// Get products by special criteria
const bestSellers = dataLayer.getBestSellerProducts();
const newProducts = dataLayer.getNewProducts();
const discountedProducts = dataLayer.getDiscountedProducts();
const inStockProducts = dataLayer.getProductsInStock();
const lowStockProducts = dataLayer.getLowStockProducts(10);
```

### Enhanced Queries
```javascript
// Get enriched product with related data
const enrichedProduct = dataLayer.getEnrichedProduct(1, 'en');
// Returns product with categoryName, subcategoryName, featureName, etc.

// Search products
const searchResults = dataLayer.searchProducts('apple', 'en');

// Advanced filtering
const filteredProducts = dataLayer.filterProducts({
  categoryIds: [1, 2],
  isBestSeller: true,
  hasDiscount: true,
  minPrice: 10,
  maxPrice: 50,
  minStock: 5
});

// Get statistics
const stats = dataLayer.getProductStatistics();
```

## Usage Examples

### 1. Display Products with Category Information
```javascript
import { getEnrichedProducts } from './data/index.js';

const products = getEnrichedProducts('en');
products.forEach(product => {
  console.log(`${product.displayName} - ${product.categoryName} > ${product.subcategoryName}`);
});
```

### 2. Build Category Navigation
```javascript
import { categories, getSubcategoriesByCategory } from './data/index.js';

const navigation = categories.map(category => ({
  ...category,
  subcategories: getSubcategoriesByCategory(category.id)
}));
```

### 3. Filter Products by Multiple Criteria
```javascript
import { filterProducts } from './data/index.js';

const organicFruits = filterProducts({
  categoryIds: [1], // Fruits & Vegetables
  subcategoryIds: [1], // Fruits
  featureIds: [1], // Organic
  minStock: 1
});
```

### 4. E-commerce Product Listing
```javascript
import { getProductsByCategory, getCategoryById } from './data/index.js';

function ProductListing({ categoryId, language = 'en' }) {
  const category = getCategoryById(categoryId);
  const products = getProductsByCategory(categoryId);
  
  return (
    <div>
      <h1>{category.name[language]}</h1>
      {products.map(product => (
        <ProductCard key={product.id} product={product} language={language} />
      ))}
    </div>
  );
}
```

## Database Integration

### SQL Schema (PostgreSQL)
```sql
-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL
);

-- Subcategories table
CREATE TABLE subcategories (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id)
);

-- Features table
CREATE TABLE features (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  image VARCHAR(500),
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  discount_percentage INTEGER,
  feature_id INTEGER REFERENCES features(id),
  colors TEXT[], -- PostgreSQL array
  category_id INTEGER REFERENCES categories(id),
  subcategory_id INTEGER REFERENCES subcategories(id),
  stock INTEGER DEFAULT 0,
  is_best_seller BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB Schema
```javascript
// Categories collection
{
  _id: ObjectId,
  id: Number,
  name: {
    en: String,
    ar: String
  }
}

// Products collection
{
  _id: ObjectId,
  id: Number,
  image: String,
  name: {
    en: String,
    ar: String
  },
  description: {
    en: String,
    ar: String
  },
  originalPrice: Number,

  discountPercentage: Number,
  featureId: Number,
  colors: [String],
  categoryId: Number,
  subcategoryId: Number,
  stock: Number,
  isBestSeller: Boolean,
  isNew: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Migration from Old Structure

To migrate existing components from the old structure:

1. **Replace imports:**
   ```javascript
   // Old
   import { allProducts } from './data/products.js';
   
   // New
   import { allProducts, getBestSellerProducts } from './data/index.js';
   ```

2. **Update property access:**
   ```javascript
   // Old
   product.category.en
   product.feature.en
   
   // New
   const enrichedProduct = getEnrichedProduct(product.id, 'en');
   enrichedProduct.categoryName
   enrichedProduct.featureName
   ```

3. **Use helper functions:**
   ```javascript
   // Old
   const bestSellers = allProducts.filter(p => p.isBestSeller);
   
   // New
   const bestSellers = getBestSellerProducts();
   ```

## Future Extensibility

The new structure supports:

1. **Multiple Features per Product**: Extend `featureId` to `featureIds: number[]`
2. **Product Variants**: Add size, weight, or other variant properties
3. **Inventory Tracking**: Enhanced stock management with locations
4. **Pricing Tiers**: Support for bulk pricing or customer-specific pricing
5. **Product Reviews**: Easy integration with review systems
6. **SEO Optimization**: URL slugs and meta descriptions
7. **Multi-vendor Support**: Add vendor/supplier information

## Performance Considerations

- Use indexing on frequently queried fields (categoryId, subcategoryId, featureId)
- Implement caching for frequently accessed data
- Consider pagination for large product lists
- Use database views for complex queries
- Implement search indexing for full-text search capabilities 