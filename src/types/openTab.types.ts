import { CartItem } from "./cart.types";

export interface OpenTab {
  id?: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  status: "open" | "paid";
  createdAt: Date;
}
