export interface Product {
  id?: string;
  name: string;
  price: number;
  category: "Kopi" | "Non-Kopi" | "Makanan";
  imageUrl?: string;
}
