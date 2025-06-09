
export const categories = [
  // الفئات الرئيسية (parentCategoryId: null)
  {
    id: 1,
    name: { en: "Fruits & Vegetables", ar: "الفواكه والخضروات" },
    slug: { en: "fruits-vegetables", ar: "الفواكه-والخضروات" },
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop&crop=center",
    color: "#22c55e",
    description: { en: "Fresh fruits and vegetables", ar: "فواكه وخضروات طازجة" },
    parentCategoryId: null
  },
  {
    id: 2,
    name: { en: "Meats & Seafood", ar: "اللحوم والمأكولات البحرية" },
    slug: { en: "meats-seafood", ar: "اللحوم-والمأكولات-البحرية" },
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop&crop=center",
    color: "#ef4444",
    description: { en: "Fresh meat and seafood", ar: "لحوم ومأكولات بحرية طازجة" },
    parentCategoryId: null
  },
  {
    id: 3,
    name: { en: "Breakfast & Dairy", ar: "الإفطار ومنتجات الألبان" },
    slug: { en: "breakfast-dairy", ar: "الإفطار-ومنتجات-الألبان" },
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=200&h=200&fit=crop&crop=center",
    color: "#3b82f6",
    description: { en: "Breakfast items and dairy products", ar: "منتجات الإفطار والألبان" },
    parentCategoryId: null
  },
  {
    id: 4,
    name: { en: "Breads & Bakery", ar: "الخبز والمخبوزات" },
    slug: { en: "breads-bakery", ar: "الخبز-والمخبوزات" },
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&crop=center",
    color: "#f59e0b",
    description: { en: "Fresh bread and bakery items", ar: "خبز ومخبوزات طازجة" },
    parentCategoryId: null
  },
  {
    id: 5,
    name: { en: "Beverages", ar: "المشروبات" },
    slug: { en: "beverages", ar: "المشروبات" },
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop&crop=center",
    color: "#06b6d4",
    description: { en: "Hot and cold beverages", ar: "مشروبات ساخنة وباردة" },
    parentCategoryId: null
  },
  {
    id: 6,
    name: { en: "Frozen Foods", ar: "الأطعمة المجمدة" },
    slug: { en: "frozen-foods", ar: "الأطعمة-المجمدة" },
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=200&h=200&fit=crop&crop=center",
    color: "#8b5cf6",
    description: { en: "Frozen meals and ice cream", ar: "وجبات مجمدة وآيس كريم" },
    parentCategoryId: null
  },
  {
    id: 23,
    name: { en: "Frozen Desserts", ar: "الحلويات المجمدة" },
    slug: { en: "frozen-desserts", ar: "الحلويات-المجمدة" },
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#8b5cf6",
    description: { en: "Ice cream and frozen desserts", ar: "آيس كريم وحلويات مجمدة" },
    parentCategoryId: 6
  },
  {
    id: 203,
    name: { en: "Frozen Fruits", ar: "فواكه مجمدة" },
    slug: { en: "frozen-fruits", ar: "فواكه-مجمدة" },
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#8b5cf6",
    description: { en: "Ice cream and frozen desserts", ar: "آيس كريم وحلويات مجمدة" },
    parentCategoryId: 23
  },
  
  {
    id: 205,
      name: { en: "Frozen Apple", ar: "تفاح مجمد" },
    slug: { en: "frozen-apple", ar: "تفاح-مجمد" },
    image: "https://m.media-amazon.com/images/I/51JLJ+hIk6L._AC_UF894,1000_QL80_.jpg",
    color: "#8b5cf6",
    description: { en: "Ice cream and frozen desserts", ar: "تفاح مجمد" },
    parentCategoryId: 203
  },
  
  {
    id: 206,
      name: { en: "Frozen Orange", ar: "برتقال مجمد" },
    slug: { en: "frozen-orange", ar: "برتقال-مجمد" },
    image: "https://www.xsdfoods.com/uploads/202318522/peeling-frozen-orangec387de94-eeec-4dad-b35c-ba1182c2e357.jpg",
    color: "#8b5cf6",
    description: { en: "Ice cream and frozen desserts", ar: "برتقال مجمد" },
    parentCategoryId: 203
  },
  {
    id: 204,
    name: { en: "Ice Cream", ar: "بوظة" },
    slug: { en: "ice-cream", ar: "بوظة" },
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#8b5cf6",
    description: { en: "Ice cream and frozen desserts", ar: "آيس كريم وحلويات مجمدة" },
    parentCategoryId: 23
  },
  {
    id: 7,
    name: { en: "Biscuits & Snacks", ar: "البسكويت والوجبات الخفيفة" },
    slug: { en: "biscuits-snacks", ar: "البسكويت-والوجبات-الخفيفة" },
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop&crop=center",
    color: "#f97316",
    description: { en: "Cookies, biscuits and snacks", ar: "كوكيز وبسكويت ووجبات خفيفة" },
    parentCategoryId: null
  },
  {
    id: 8,
    name: { en: "Grocery & Staples", ar: "البقالة والأساسيات" },
    slug: { en: "grocery-staples", ar: "البقالة-والأساسيات" },
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&crop=center",
    color: "#84cc16",
    description: { en: "Essential grocery items", ar: "أساسيات البقالة" },
    parentCategoryId: null
  },
  {
    id: 9,
    name: { en: "Household Needs", ar: "احتياجات المنزل" },
    slug: { en: "household-needs", ar: "احتياجات-المنزل" },
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200&h=200&fit=crop&crop=center",
    color: "#14b8a6",
    description: { en: "Cleaning and household items", ar: "منتجات التنظيف والمنزل" },
    parentCategoryId: null
  },
  {
    id: 10,
    name: { en: "Healthcare", ar: "الرعاية الصحية" },
    slug: { en: "healthcare", ar: "الرعاية-الصحية" },
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop&crop=center",
    color: "#ec4899",
    description: { en: "Health and personal care", ar: "الصحة والعناية الشخصية" },
    parentCategoryId: null
  },
  {
    id: 11,
    name: { en: "Baby & Pregnancy", ar: "الطفل والحمل" },
    slug: { en: "baby-pregnancy", ar: "الطفل-والحمل" },
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=200&fit=crop&crop=center",
    color: "#a855f7",
    description: { en: "Baby care and pregnancy needs", ar: "عناية الطفل ومستلزمات الحمل" },
    parentCategoryId: null
  },
  // الفئات الفرعية
  {
    id: 12,
    name: { en: "Fruits", ar: "الفواكه" },
    slug: { en: "fruits", ar: "الفواكه" },
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#22c55e", // نفس لون الفئة الأم
    description: { en: "Fresh fruits", ar: "فواكه طازجة" },
    parentCategoryId: 1
  },
  {
    id: 13,
    name: { en: "Vegetables", ar: "الخضروات" },
    slug: { en: "vegetables", ar: "الخضروات" },
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#22c55e",
    description: { en: "Fresh vegetables", ar: "خضروات طازجة" },
    parentCategoryId: 1
  },
  {
    id: 14,
    name: { en: "Fresh Meat", ar: "اللحوم الطازجة" },
    slug: { en: "fresh-meat", ar: "اللحوم-الطازجة" },
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#ef4444",
    description: { en: "Fresh cuts of meat", ar: "لحوم طازجة مقطعة" },
    parentCategoryId: 2
  },
  {
    id: 15,
    name: { en: "Seafood", ar: "المأكولات البحرية" },
    slug: { en: "seafood", ar: "المأكولات-البحرية" },
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#ef4444",
    description: { en: "Fresh seafood", ar: "مأكولات بحرية طازجة" },
    parentCategoryId: 2
  },
  {
    id: 16,
    name: { en: "Dairy Products", ar: "منتجات الألبان" },
    slug: { en: "dairy-products", ar: "منتجات-الألبان" },
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#3b82f6",
    description: { en: "Milk, cheese, and dairy", ar: "حليب، جبن، ومنتجات ألبان" },
    parentCategoryId: 3
  },
  {
    id: 17,
    name: { en: "Breakfast Items", ar: "أصناف الإفطار" },
    slug: { en: "breakfast-items", ar: "أصناف-الإفطار" },
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#3b82f6",
    description: { en: "Cereals and breakfast foods", ar: "حبوب وأطعمة الإفطار" },
    parentCategoryId: 3
  },
  {
    id: 18,
    name: { en: "Fresh Bread", ar: "الخبز الطازج" },
    slug: { en: "fresh-bread", ar: "الخبز-الطازج" },
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#f59e0b",
    description: { en: "Freshly baked bread", ar: "خبز طازج" },
    parentCategoryId: 4
  },
  {
    id: 19,
    name: { en: "Pastries", ar: "المعجنات" },
    slug: { en: "pastries", ar: "المعجنات" },
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#f59e0b",
    description: { en: "Fresh pastries", ar: "معجنات طازجة" },
    parentCategoryId: 4
  },
  {
    id: 20,
    name: { en: "Hot Beverages", ar: "المشروبات الساخنة" },
    slug: { en: "hot-beverages", ar: "المشروبات-الساخنة" },
    image: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#06b6d4",
    description: { en: "Tea, coffee, and hot drinks", ar: "شاي، قهوة، ومشروبات ساخنة" },
    parentCategoryId: 5
  },
  
  {
    id: 200,
    name: { en: "Hot Beverages", ar: "55المشروبات الساخنة" },
    slug: { en: "hot-beverages", ar: "55المشروبات-الساخنة" },
    image: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#06b6d4",
    description: { en: "Tea, coffee, and hot drinks", ar: "شاي، قهوة، ومشروبات ساخنة" },
    parentCategoryId: 20
  },
  
  {
    id: 2001,
    name: { en: "Hot Beverages", ar: "2001المشروبات الساخنة" },
    slug: { en: "hot-beverages", ar: "2001المشروبات-الساخنة" },
    image: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#06b6d4",
    description: { en: "Tea, coffee, and hot drinks", ar: "شاي، قهوة، ومشروبات ساخنة" },
    parentCategoryId: 200
  },
  {
    id: 21,
    name: { en: "Cold Beverages", ar: "المشروبات الباردة" },
    slug: { en: "cold-beverages", ar: "المشروبات-الباردة" },
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#06b6d4",
    description: { en: "Juices and cold drinks", ar: "عصائر ومشروبات باردة" },
    parentCategoryId: 5
  },
  {
    id: 22,
    name: { en: "Frozen Meals", ar: "الوجبات المجمدة" },
    slug: { en: "frozen-meals", ar: "الوجبات-المجمدة" },
    image: "https://www.dari.sa/wp-content/uploads/2022/10/DARI-Chicken-Tomato-Pasta.webp",
    color: "#8b5cf6",
    description: { en: "Ready-to-cook frozen meals", ar: "وجبات مجمدة جاهزة للطهي" },
    parentCategoryId: 6
  },
  
  {
    id: 24,
    name: { en: "Cookies & Biscuits", ar: "الكوكيز والبسكويت" },
    slug: { en: "cookies-biscuits", ar: "الكوكيز-والبسكويت" },
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#f97316",
    description: { en: "Assorted cookies and biscuits", ar: "كوكيز وبسكويت متنوع" },
    parentCategoryId: 7
  },
  {
    id: 25,
    name: { en: "Nuts & Snacks", ar: "المكسرات والوجبات الخفيفة" },
    slug: { en: "nuts-snacks", ar: "المكسرات-والوجبات-الخفيفة" },
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#f97316",
    description: { en: "Nuts and savory snacks", ar: "مكسرات ووجبات خفيفة مالحة" },
    parentCategoryId: 7
  },
  {
    id: 26,
    name: { en: "Cooking Essentials", ar: "أساسيات الطبخ" },
    slug: { en: "cooking-essentials", ar: "أساسيات-الطبخ" },
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#84cc16",
    description: { en: "Oils, spices, and cooking ingredients", ar: "زيوت، بهارات، ومكونات الطبخ" },
    parentCategoryId: 8
  },
  {
    id: 27,
    name: { en: "Grains & Rice", ar: "الحبوب والأرز" },
    slug: { en: "grains-rice", ar: "الحبوب-والأرز" },
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#84cc16",
    description: { en: "Rice, grains, and pulses", ar: "أرز، حبوب، وبقوليات" },
    parentCategoryId: 8
  },
  {
    id: 28,
    name: { en: "Cleaning Supplies", ar: "مستلزمات التنظيف" },
    slug: { en: "cleaning-supplies", ar: "مستلزمات-التنظيف" },
    image: "https://mysyria.ca/wp-content/uploads/2020/08/%D9%85%D9%86%D8%B8%D9%81%D8%A7%D8%AA.jpg",
    color: "#14b8a6",
    description: { en: "Detergents and cleaning products", ar: "منظفات ومنتجات تنظيف" },
    parentCategoryId: 9
  },
  {
    id: 29,
    name: { en: "Paper Products", ar: "المنتجات الورقية" },
    slug: { en: "paper-products", ar: "المنتجات-الورقية" },
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#14b8a6",
    description: { en: "Tissues and paper goods", ar: "مناديل ومنتجات ورقية" },
    parentCategoryId: 9
  },
  {
    id: 30,
    name: { en: "Vitamins & Supplements", ar: "الفيتامينات والمكملات" },
    slug: { en: "vitamins-supplements", ar: "الفيتامينات-والمكملات" },
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#ec4899",
    description: { en: "Vitamins and health supplements", ar: "فيتامينات ومكملات صحية" },
    parentCategoryId: 10
  },
  {
    id: 31,
    name: { en: "Personal Care", ar: "العناية الشخصية" },
    slug: { en: "personal-care", ar: "العناية-الشخصية" },
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#ec4899",
    description: { en: "Personal care products", ar: "منتجات العناية الشخصية" },
    parentCategoryId: 10
  },
  {
    id: 32,
    name: { en: "Baby Care", ar: "رعاية الطفل" },
    slug: { en: "baby-care", ar: "رعاية-الطفل" },
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    color: "#a855f7",
    description: { en: "Baby care essentials", ar: "مستلزمات رعاية الطفل" },
    parentCategoryId: 11
  }
];

export default categories; 