export interface Ingredient {
  id?: string;
  name: string;
  stock: number;
  unit: "gram" | "ml" | "pcs";
  minStock: number;
}
