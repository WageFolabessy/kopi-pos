import { CartItem } from "./cart.types";

export interface Transaction {
  id?: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: "Tunai" | "QRIS";
  amountPaid?: number;
  change?: number;
  createdAt: Date;
}
