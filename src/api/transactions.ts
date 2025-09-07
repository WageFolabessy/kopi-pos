import {
    collection,
    doc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";
import { CartItem } from "../types";
import { db } from "./firebase";

export const processTransaction = async (
  cart: CartItem[],
  totalAmount: number,
  amountPaid: number
) => {
  if (cart.length === 0) {
    throw new Error("Keranjang tidak boleh kosong.");
  }

  await runTransaction(db, async (transaction) => {
    const ingredientUpdates: {
      ref: any;
      newStock: number;
      name: string;
    }[] = [];

    for (const item of cart) {
      if (item.product.recipe && item.product.recipe.length > 0) {
        for (const recipeItem of item.product.recipe) {
          const ingredientRef = doc(db, "inventory", recipeItem.ingredientId);
          const ingredientDoc = await transaction.get(ingredientRef);

          if (!ingredientDoc.exists()) {
            throw new Error(
              `Bahan baku "${recipeItem.ingredientName}" tidak ditemukan.`
            );
          }

          const currentStock = ingredientDoc.data().stock;
          const requiredStock = recipeItem.quantity * item.quantity;
          const newStock = currentStock - requiredStock;

          if (newStock < 0) {
            throw new Error(
              `Stok untuk "${recipeItem.ingredientName}" tidak mencukupi.`
            );
          }

          ingredientUpdates.push({
            ref: ingredientRef,
            newStock: newStock,
            name: recipeItem.ingredientName,
          });
        }
      }
    }

    const sanitizedCart = cart.map((item) => {
      const productSnapshot = {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        category: item.product.category,
        imageUrl: item.product.imageUrl || null,
      };

      const sanitizedItem: any = {
        product: productSnapshot,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      };
      if (item.selectedVariant) {
        sanitizedItem.selectedVariant = item.selectedVariant;
      }
      if (item.selectedModifiers && item.selectedModifiers.length > 0) {
        sanitizedItem.selectedModifiers = item.selectedModifiers;
      }
      return sanitizedItem;
    });

    const transactionRef = doc(collection(db, "transactions"));
    const newTransactionData = {
      items: sanitizedCart,
      totalAmount,
      paymentMethod: "Tunai",
      amountPaid,
      change: amountPaid - totalAmount,
      createdAt: serverTimestamp(),
    };
    transaction.set(transactionRef, newTransactionData);

    ingredientUpdates.forEach((update) => {
      transaction.update(update.ref, { stock: update.newStock });
    });
  });
};
