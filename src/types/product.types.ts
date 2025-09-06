export interface Variant {
  name: string;
  priceAdjustment: number;
}

export interface Modifier {
  name: string;
  priceAdjustment: number;
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: "gram" | "ml" | "pcs";
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  category: "Kopi" | "Non-Kopi" | "Makanan";
  imageUrl?: string;
  variants?: Variant[];
  modifiers?: Modifier[];
  recipe?: RecipeItem[];
}
