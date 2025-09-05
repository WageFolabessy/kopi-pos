export interface Variant {
  name: string;
  priceAdjustment: number;
}

export interface Modifier {
  name: string;
  priceAdjustment: number;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  category: "Kopi" | "Non-Kopi" | "Makanan";
  imageUrl?: string;
  variants?: Variant[];
  modifiers?: Modifier[];
}

export interface Ingredient {
  id?: string;
  name: string;
  stock: number;
  unit: "gram" | "ml" | "pcs";
  minStock: number;
}
