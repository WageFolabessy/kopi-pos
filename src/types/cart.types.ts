import { Modifier, Product, Variant } from "./product.types";

export interface CartItem {
  product: Product;
  quantity: number;
  totalPrice: number;
  selectedVariant?: Variant;
  selectedModifiers?: Modifier[];
}
