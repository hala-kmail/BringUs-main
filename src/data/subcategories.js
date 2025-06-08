/**
 * Subcategories data with multilingual support and category relationships
 * Each subcategory includes a unique ID, name, image, categoryId, and slug
 * Slug is used in URLs for navigation (e.g., /subcategory/fruits)
 * categoryId links the subcategory to its parent category
 */
export const subcategories = [
  // Fruits & Vegetables subcategories
  {
    id: 1,
    name: {
      en: "Fruits",
      ar: "الفواكه"
    },
    slug: {
      en: "fruits",
      ar: "الفواكه"
    },
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 1
  },
  {
    id: 2,
    name: {
      en: "Vegetables",
      ar: "الخضروات"
    },
    slug: {
      en: "vegetables",
      ar: "الخضروات"
    },
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 1
  },
  
  // Meats & Seafood subcategories
  {
    id: 3,
    name: {
      en: "Fresh Meat",
      ar: "اللحوم الطازجة"
    },
    slug: {
      en: "fresh-meat",
      ar: "اللحوم-الطازجة"
    },
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 2
  },
  {
    id: 4,
    name: {
      en: "Seafood",
      ar: "المأكولات البحرية"
    },
    slug: {
      en: "seafood",
      ar: "المأكولات-البحرية"
    },
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 2
  },
  
  // Breakfast & Dairy subcategories
  {
    id: 5,
    name: {
      en: "Dairy Products",
      ar: "منتجات الألبان"
    },
    slug: {
      en: "dairy-products",
      ar: "منتجات-الألبان"
    },
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 3
  },
  {
    id: 6,
    name: {
      en: "Breakfast Items",
      ar: "أصناف الإفطار"
    },
    slug: {
      en: "breakfast-items",
      ar: "أصناف-الإفطار"
    },
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 3
  },
  
  // Breads & Bakery subcategories
  {
    id: 7,
    name: {
      en: "Fresh Bread",
      ar: "الخبز الطازج"
    },
    slug: {
      en: "fresh-bread",
      ar: "الخبز-الطازج"
    },
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 4
  },
  {
    id: 8,
    name: {
      en: "Pastries",
      ar: "المعجنات"
    },
    slug: {
      en: "pastries",
      ar: "المعجنات"
    },
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 4
  },
  
  // Beverages subcategories
  {
    id: 9,
    name: {
      en: "Hot Beverages",
      ar: "المشروبات الساخنة"
    },
    slug: {
      en: "hot-beverages",
      ar: "المشروبات-الساخنة"
    },
    image: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 5
  },
  {
    id: 10,
    name: {
      en: "Cold Beverages",
      ar: "المشروبات الباردة"
    },
    slug: {
      en: "cold-beverages",
      ar: "المشروبات-الباردة"
    },
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 5
  },
  
  // Frozen Foods subcategories
  {
    id: 11,
    name: {
      en: "Frozen Meals",
      ar: "الوجبات المجمدة"
    },
    slug: {
      en: "frozen-meals",
      ar: "الوجبات-المجمدة"
    },
    image: "https://www.dari.sa/wp-content/uploads/2022/10/DARI-Chicken-Tomato-Pasta.webp",
    categoryId: 6
  },
  {
    id: 12,
    name: {
      en: "Frozen Desserts",
      ar: "الحلويات المجمدة"
    },
    slug: {
      en: "frozen-desserts",
      ar: "الحلويات-المجمدة"
    },
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 6
  },
  
  // Biscuits & Snacks subcategories
  {
    id: 13,
    name: {
      en: "Cookies & Biscuits",
      ar: "الكوكيز والبسكويت"
    },
    slug: {
      en: "cookies-biscuits",
      ar: "الكوكيز-والبسكويت"
    },
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 7
  },
  {
    id: 14,
    name: {
      en: "Nuts & Snacks",
      ar: "المكسرات والوجبات الخفيفة"
    },
    slug: {
      en: "nuts-snacks",
      ar: "المكسرات-والوجبات-الخفيفة"
    },
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 7
  },
  
  // Grocery & Staples subcategories
  {
    id: 15,
    name: {
      en: "Cooking Essentials",
      ar: "أساسيات الطبخ"
    },
    slug: {
      en: "cooking-essentials",
      ar: "أساسيات-الطبخ"
    },
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 8
  },
  {
    id: 16,
    name: {
      en: "Grains & Rice",
      ar: "الحبوب والأرز"
    },
    slug: {
      en: "grains-rice",
      ar: "الحبوب-والأرز"
    },
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 8
  },
  
  // Household Needs subcategories
  {
    id: 17,
    name: {
      en: "Cleaning Supplies",
      ar: "مستلزمات التنظيف"
    },
    slug: {
      en: "cleaning-supplies",
      ar: "مستلزمات-التنظيف"
    },
    image: "https://mysyria.ca/wp-content/uploads/2020/08/%D9%85%D9%86%D8%B8%D9%81%D8%A7%D8%AA.jpg",
    categoryId: 9
  },
  {
    id: 18,
    name: {
      en: "Paper Products",
      ar: "المنتجات الورقية"
    },
    slug: {
      en: "paper-products",
      ar: "المنتجات-الورقية"
    },
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 9
  },
  
  // Healthcare subcategories
  {
    id: 19,
    name: {
      en: "Vitamins & Supplements",
      ar: "الفيتامينات والمكملات"
    },
    slug: {
      en: "vitamins-supplements",
      ar: "الفيتامينات-والمكملات"
    },
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 10
  },
  {
    id: 20,
    name: {
      en: "Personal Care",
      ar: "العناية الشخصية"
    },
    slug: {
      en: "personal-care",
      ar: "العناية-الشخصية"
    },
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 10
  },
  
  // Baby & Pregnancy subcategories
  {
    id: 21,
    name: {
      en: "Baby Care",
      ar: "رعاية الطفل"
    },
    slug: {
      en: "baby-care",
      ar: "رعاية-الطفل"
    },
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 11
  },
  {
    id: 22,
    name: {
      en: "Baby Food",
      ar: "طعام الأطفال"
    },
    slug: {
      en: "baby-food",
      ar: "طعام-الأطفال"
    },
    image: "https://images.unsplash.com/photo-1607500243345-f82b8db4f18b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    categoryId: 11
  }
];

export default subcategories;