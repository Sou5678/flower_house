// Real flower products for Amour Florals
const products = [
  // ROSES CATEGORY
  {
    name: 'Classic Red Rose Bouquet',
    description: 'A timeless arrangement of 12 premium red roses, perfectly arranged with baby\'s breath and elegant wrapping. Symbol of deep love and passion.',
    price: 899,
    originalPrice: 1199,
    categorySlug: 'roses',
    images: [
      {
        public_id: 'amour-florals/products/classic-red-roses',
        url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=800&fit=crop'
        },
        alt: 'Classic Red Rose Bouquet',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['anniversary', 'birthday', 'just-because'],
    flowerTypes: ['roses'],
    colors: ['red'],
    sizes: [
      { name: 'Standard (12 roses)', price: 0, description: '12 premium red roses' },
      { name: 'Deluxe (18 roses)', price: 300, description: '18 premium red roses' },
      { name: 'Premium (24 roses)', price: 600, description: '24 premium red roses' }
    ],
    vases: [
      { name: 'No Vase', price: 0, description: 'Beautiful wrapping only' },
      { name: 'Glass Vase', price: 250, description: 'Clear glass vase' },
      { name: 'Premium Ceramic Vase', price: 450, description: 'Designer ceramic vase' }
    ],
    inventory: {
      stock: 25,
      lowStockThreshold: 5,
      isAvailable: true
    },
    isFeatured: true,
    isPopular: true,
    tags: ['bestseller', 'romantic', 'classic'],
    careInstructions: 'Keep in cool water, trim stems daily, change water every 2-3 days. Avoid direct sunlight.',
    deliveryInfo: 'Same-day delivery available for orders placed before 2 PM. Free delivery within city limits.',
    seo: {
      title: 'Classic Red Rose Bouquet - Premium Quality Roses',
      description: 'Order classic red rose bouquet online. 12 premium red roses with elegant wrapping. Perfect for anniversaries and romantic occasions.',
      keywords: ['red roses', 'rose bouquet', 'romantic flowers', 'anniversary flowers']
    }
  },
  {
    name: 'Pink Rose Garden Arrangement',
    description: 'Soft pink roses arranged in a charming garden style with eucalyptus and seasonal greens. Perfect for expressing gentle affection.',
    price: 749,
    originalPrice: 999,
    categorySlug: 'roses',
    images: [
      {
        public_id: 'amour-florals/products/pink-rose-garden',
        url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop'
        },
        alt: 'Pink Rose Garden Arrangement',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['birthday', 'congratulations', 'just-because'],
    flowerTypes: ['roses'],
    colors: ['pink'],
    sizes: [
      { name: 'Compact', price: 0, description: '8-10 pink roses' },
      { name: 'Standard', price: 200, description: '12-15 pink roses' },
      { name: 'Grand', price: 400, description: '18-20 pink roses' }
    ],
    vases: [
      { name: 'Rustic Basket', price: 200, description: 'Natural wicker basket' },
      { name: 'Ceramic Pot', price: 300, description: 'Garden-style ceramic pot' }
    ],
    inventory: {
      stock: 18,
      lowStockThreshold: 5,
      isAvailable: true
    },
    isPopular: true,
    tags: ['garden-style', 'gentle', 'feminine'],
    careInstructions: 'Place in bright, indirect light. Water when soil feels dry. Remove wilted blooms to encourage new growth.',
    deliveryInfo: 'Available for next-day delivery. Special care packaging for garden arrangements.'
  },
  {
    name: 'White Rose Elegance',
    description: 'Pure white roses symbolizing new beginnings and pure love. Elegantly arranged with white ribbon and minimal greenery.',
    price: 849,
    categorySlug: 'roses',
    images: [
      {
        public_id: 'amour-florals/products/white-rose-elegance',
        url: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&h=800&fit=crop'
        },
        alt: 'White Rose Elegance Bouquet',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['wedding', 'sympathy', 'congratulations'],
    flowerTypes: ['roses'],
    colors: ['white'],
    sizes: [
      { name: 'Petite (6 roses)', price: 0, description: '6 white roses' },
      { name: 'Classic (12 roses)', price: 250, description: '12 white roses' },
      { name: 'Luxury (18 roses)', price: 500, description: '18 white roses' }
    ],
    inventory: {
      stock: 15,
      lowStockThreshold: 3,
      isAvailable: true
    },
    tags: ['elegant', 'pure', 'minimalist'],
    careInstructions: 'Keep stems in clean, cool water. Change water every 2 days. Trim stems at an angle under running water.'
  },

  // LILIES CATEGORY
  {
    name: 'Stargazer Lily Bouquet',
    description: 'Stunning stargazer lilies with their distinctive pink and white petals and intoxicating fragrance. A show-stopping arrangement.',
    price: 1099,
    originalPrice: 1399,
    categorySlug: 'lilies',
    images: [
      {
        public_id: 'amour-florals/products/stargazer-lilies',
        url: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=800&h=800&fit=crop'
        },
        alt: 'Stargazer Lily Bouquet',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['birthday', 'congratulations', 'anniversary'],
    flowerTypes: ['lilies'],
    colors: ['pink', 'white'],
    sizes: [
      { name: 'Single Stem', price: 0, description: '3-4 lily stems' },
      { name: 'Bouquet', price: 300, description: '6-8 lily stems' },
      { name: 'Arrangement', price: 600, description: '10-12 lily stems with greens' }
    ],
    vases: [
      { name: 'Tall Glass Vase', price: 350, description: 'Perfect height for lilies' },
      { name: 'Crystal Vase', price: 650, description: 'Premium crystal vase' }
    ],
    inventory: {
      stock: 12,
      lowStockThreshold: 3,
      isAvailable: true
    },
    isFeatured: true,
    tags: ['fragrant', 'exotic', 'dramatic'],
    careInstructions: 'Remove pollen-heavy stamens to prevent staining. Keep in cool location with bright, indirect light.',
    deliveryInfo: 'Carefully packaged to preserve delicate petals. Same-day delivery available.'
  },
  {
    name: 'Pure White Lily Arrangement',
    description: 'Elegant white lilies arranged with lush greenery. Perfect for expressing sympathy, celebration, or pure admiration.',
    price: 949,
    categorySlug: 'lilies',
    images: [
      {
        public_id: 'amour-florals/products/white-lilies',
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop'
        },
        alt: 'Pure White Lily Arrangement',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['sympathy', 'wedding', 'congratulations'],
    flowerTypes: ['lilies'],
    colors: ['white'],
    sizes: [
      { name: 'Modest', price: 0, description: '4-5 lily stems' },
      { name: 'Standard', price: 250, description: '7-8 lily stems' },
      { name: 'Grand', price: 500, description: '10-12 lily stems' }
    ],
    inventory: {
      stock: 20,
      lowStockThreshold: 5,
      isAvailable: true
    },
    tags: ['peaceful', 'elegant', 'respectful'],
    careInstructions: 'Change water every 2-3 days. Trim stems regularly. Remove spent blooms to encourage new ones.'
  },

  // TULIPS CATEGORY
  {
    name: 'Spring Tulip Mix',
    description: 'A vibrant collection of mixed tulips in spring colors - yellow, pink, red, and purple. Brings the joy of spring indoors.',
    price: 649,
    originalPrice: 849,
    categorySlug: 'tulips',
    images: [
      {
        public_id: 'amour-florals/products/spring-tulip-mix',
        url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&h=800&fit=crop'
        },
        alt: 'Spring Tulip Mix Bouquet',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['birthday', 'just-because', 'congratulations'],
    flowerTypes: ['tulips'],
    colors: ['mixed', 'yellow', 'pink', 'red', 'purple'],
    sizes: [
      { name: 'Petite (15 tulips)', price: 0, description: '15 mixed tulips' },
      { name: 'Standard (25 tulips)', price: 200, description: '25 mixed tulips' },
      { name: 'Abundant (40 tulips)', price: 400, description: '40 mixed tulips' }
    ],
    inventory: {
      stock: 30,
      lowStockThreshold: 8,
      isAvailable: true
    },
    isPopular: true,
    tags: ['cheerful', 'spring', 'colorful'],
    careInstructions: 'Keep in cool water. Tulips continue to grow in vase, so trim as needed. Enjoy for 5-7 days.',
    deliveryInfo: 'Available during spring season (February-May). Pre-orders accepted for peak season.'
  },
  {
    name: 'Yellow Tulip Sunshine',
    description: 'Bright yellow tulips that bring sunshine and happiness to any space. Perfect for lifting spirits and celebrating joy.',
    price: 599,
    categorySlug: 'tulips',
    images: [
      {
        public_id: 'amour-florals/products/yellow-tulips',
        url: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop'
        },
        alt: 'Yellow Tulip Sunshine Bouquet',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['birthday', 'congratulations', 'just-because'],
    flowerTypes: ['tulips'],
    colors: ['yellow'],
    sizes: [
      { name: 'Bunch (12 tulips)', price: 0, description: '12 yellow tulips' },
      { name: 'Bouquet (20 tulips)', price: 150, description: '20 yellow tulips' },
      { name: 'Garden (30 tulips)', price: 300, description: '30 yellow tulips' }
    ],
    inventory: {
      stock: 25,
      lowStockThreshold: 6,
      isAvailable: true
    },
    tags: ['sunny', 'cheerful', 'uplifting'],
    careInstructions: 'Place in bright location but avoid direct sunlight. Change water every 2 days for longest life.'
  },

  // ORCHIDS CATEGORY
  {
    name: 'Phalaenopsis Orchid Plant',
    description: 'Elegant white phalaenopsis orchid in decorative pot. Long-lasting blooms that can flower for months with proper care.',
    price: 1299,
    originalPrice: 1599,
    categorySlug: 'orchids',
    images: [
      {
        public_id: 'amour-florals/products/phalaenopsis-orchid',
        url: 'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=800&h=800&fit=crop'
        },
        alt: 'Phalaenopsis Orchid Plant',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['congratulations', 'just-because', 'wedding'],
    flowerTypes: ['orchids'],
    colors: ['white'],
    sizes: [
      { name: 'Single Spike', price: 0, description: 'One flowering spike' },
      { name: 'Double Spike', price: 400, description: 'Two flowering spikes' },
      { name: 'Triple Spike', price: 800, description: 'Three flowering spikes' }
    ],
    vases: [
      { name: 'Ceramic Pot', price: 0, description: 'Included decorative pot' },
      { name: 'Premium Planter', price: 300, description: 'Designer ceramic planter' }
    ],
    inventory: {
      stock: 8,
      lowStockThreshold: 2,
      isAvailable: true
    },
    isFeatured: true,
    tags: ['luxury', 'long-lasting', 'sophisticated'],
    careInstructions: 'Water weekly with ice cubes. Bright, indirect light. Avoid overwatering. Blooms last 2-3 months.',
    deliveryInfo: 'Carefully packaged for safe transport. Includes care instructions and orchid food.'
  },

  // MIXED BOUQUETS CATEGORY
  {
    name: 'Garden Party Mix',
    description: 'A delightful combination of roses, lilies, and seasonal flowers with lush greenery. Perfect for celebrations and special occasions.',
    price: 1199,
    originalPrice: 1499,
    categorySlug: 'mixed-bouquets',
    images: [
      {
        public_id: 'amour-florals/products/garden-party-mix',
        url: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=800&h=800&fit=crop'
        },
        alt: 'Garden Party Mix Bouquet',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['birthday', 'congratulations', 'anniversary', 'just-because'],
    flowerTypes: ['roses', 'lilies', 'mixed'],
    colors: ['mixed'],
    sizes: [
      { name: 'Charming', price: 0, description: 'Compact mixed arrangement' },
      { name: 'Delightful', price: 300, description: 'Standard mixed arrangement' },
      { name: 'Spectacular', price: 600, description: 'Large mixed arrangement' }
    ],
    vases: [
      { name: 'Round Glass Vase', price: 250, description: 'Classic round vase' },
      { name: 'Designer Ceramic', price: 450, description: 'Artisan ceramic vase' }
    ],
    inventory: {
      stock: 15,
      lowStockThreshold: 4,
      isAvailable: true
    },
    isFeatured: true,
    isPopular: true,
    tags: ['mixed', 'celebration', 'designer'],
    careInstructions: 'Different flowers have different needs. Change water every 2 days and trim stems regularly.',
    deliveryInfo: 'Expertly arranged by our florists. Same-day delivery available for orders before 1 PM.'
  },

  // SEASONAL FLOWERS CATEGORY
  {
    name: 'Autumn Harvest Arrangement',
    description: 'Warm autumn colors featuring chrysanthemums, sunflowers, and seasonal foliage. Celebrates the beauty of fall.',
    price: 849,
    categorySlug: 'seasonal-flowers',
    images: [
      {
        public_id: 'amour-florals/products/autumn-harvest',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop'
        },
        alt: 'Autumn Harvest Arrangement',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['just-because', 'congratulations'],
    flowerTypes: ['seasonal'],
    colors: ['yellow', 'red', 'mixed'],
    sizes: [
      { name: 'Cozy', price: 0, description: 'Small autumn arrangement' },
      { name: 'Harvest', price: 200, description: 'Medium autumn display' },
      { name: 'Abundant', price: 400, description: 'Large autumn centerpiece' }
    ],
    inventory: {
      stock: 10,
      lowStockThreshold: 3,
      isAvailable: true
    },
    tags: ['seasonal', 'autumn', 'warm-colors'],
    careInstructions: 'Seasonal flowers vary in care needs. Keep in cool water and trim stems regularly.'
  },

  // WEDDING FLOWERS CATEGORY
  {
    name: 'Bridal Elegance Bouquet',
    description: 'Classic white and cream bridal bouquet with roses, peonies, and eucalyptus. Timeless elegance for your special day.',
    price: 1599,
    originalPrice: 1999,
    categorySlug: 'wedding-flowers',
    images: [
      {
        public_id: 'amour-florals/products/bridal-elegance',
        url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=800&fit=crop'
        },
        alt: 'Bridal Elegance Bouquet',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['wedding'],
    flowerTypes: ['roses', 'mixed'],
    colors: ['white'],
    sizes: [
      { name: 'Petite Bridal', price: 0, description: 'Compact bridal bouquet' },
      { name: 'Classic Bridal', price: 400, description: 'Traditional size bouquet' },
      { name: 'Cascading Bridal', price: 800, description: 'Large cascading bouquet' }
    ],
    inventory: {
      stock: 5,
      lowStockThreshold: 2,
      isAvailable: true
    },
    isFeatured: true,
    tags: ['bridal', 'wedding', 'elegant'],
    careInstructions: 'Keep refrigerated until ceremony. Mist lightly. Handle with care to preserve shape.',
    deliveryInfo: 'Special wedding delivery service. Consultation available for custom arrangements.'
  },

  // SYMPATHY FLOWERS CATEGORY
  {
    name: 'Peaceful Remembrance',
    description: 'A respectful arrangement of white lilies and roses with soft greenery. Expresses sympathy and peaceful remembrance.',
    price: 1099,
    categorySlug: 'sympathy-flowers',
    images: [
      {
        public_id: 'amour-florals/products/peaceful-remembrance',
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
        variants: {
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop',
          small: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
          medium: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
          large: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=1200&fit=crop',
          original: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop'
        },
        alt: 'Peaceful Remembrance Arrangement',
        isPrimary: true,
        width: 800,
        height: 800,
        format: 'jpg'
      }
    ],
    occasions: ['sympathy'],
    flowerTypes: ['lilies', 'roses'],
    colors: ['white'],
    sizes: [
      { name: 'Modest', price: 0, description: 'Small sympathy arrangement' },
      { name: 'Standard', price: 300, description: 'Traditional sympathy display' },
      { name: 'Memorial', price: 600, description: 'Large memorial arrangement' }
    ],
    inventory: {
      stock: 8,
      lowStockThreshold: 2,
      isAvailable: true
    },
    tags: ['sympathy', 'peaceful', 'respectful'],
    careInstructions: 'Designed for lasting beauty. Change water gently every few days.',
    deliveryInfo: 'Respectful delivery service. Can be sent directly to funeral home or family.'
  }
];

module.exports = products;