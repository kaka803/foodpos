export const CATEGORIES = [
  { id: "all", label: "All Items", icon: "✨" },
  { id: "pizza", label: "Pizza", icon: "🍕" },
  { id: "special pizza", label: "Special Pizza", icon: "👑" },
  { id: "sandwich", label: "Sandwich", icon: "🥪" },
  { id: "burger", label: "Burger", icon: "🍔" },
  { id: "shawarma", label: "Shawarma", icon: "🌯" },
  { id: "pasta", label: "Pasta", icon: "🍝" },
  { id: "wraps", label: "Wraps", icon: "🌮" },
  { id: "paratha roll", label: "Paratha Roll", icon: "🫓" },
  { id: "nuggets", label: "Nuggets", icon: "🍗" },
  { id: "fries", label: "Fries", icon: "🍟" },
  { id: "samosa/roll", label: "Samosa/Roll", icon: "🥟" },
  { id: "drinks", label: "Drinks", icon: "🥤" },
  { id: "deals", label: "Deals", icon: "⭐" },
];

export const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c.id !== "all");

export const FOOD_IMAGE_PRESETS = [
  { label: "Pizza", category: "pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80" },
  { label: "Special Pizza", category: "special pizza", url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80" },
  { label: "Sandwich", category: "sandwich", url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80" },
  { label: "Burger", category: "burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80" },
  { label: "Shawarma", category: "shawarma", url: "https://images.unsplash.com/photo-1662116765994-1e4200c43589?w=500&auto=format&fit=crop&q=80" },
  { label: "Pasta", category: "pasta", url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80" },
  { label: "Wraps", category: "wraps", url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80" },
  { label: "Paratha Roll", category: "paratha roll", url: "https://images.unsplash.com/photo-1606471191009-63994c53433b?w=500&auto=format&fit=crop&q=80" },
  { label: "Nuggets", category: "nuggets", url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80" },
  { label: "Fries", category: "fries", url: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80" },
  { label: "Samosa/Roll", category: "samosa/roll", url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80" },
  { label: "Drinks", category: "drinks", url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80" },
  { label: "Deal / Combo", category: "deals", url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80" },
];
