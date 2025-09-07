import {
    collection,
    doc,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    Timestamp,
    where,
} from "firebase/firestore";
import { CartItem, OpenTab, Transaction } from "../types";
import { db } from "./firebase";

export const createOpenTab = async (
  cart: CartItem[],
  totalAmount: number,
  customerName: string
) => {
  if (cart.length === 0) throw new Error("Keranjang tidak boleh kosong.");
  if (!customerName.trim()) throw new Error("Nama pelanggan harus diisi.");

  await runTransaction(db, async (transaction) => {
    const ingredientUpdates: any[] = [];
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
          ingredientUpdates.push({ ref: ingredientRef, newStock });
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

    const newTabRef = doc(collection(db, "openTabs"));
    const newTabData = {
      customerName,
      items: sanitizedCart,
      totalAmount,
      status: "open",
      createdAt: serverTimestamp(),
    };
    transaction.set(newTabRef, newTabData);

    ingredientUpdates.forEach((update) => {
      transaction.update(update.ref, { stock: update.newStock });
    });
  });
};

export const getOpenTabs = (callback: (tabs: OpenTab[]) => void) => {
  const q = query(collection(db, "openTabs"), where("status", "==", "open"));
  return onSnapshot(q, (querySnapshot) => {
    const tabs: OpenTab[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAtTimestamp = data.createdAt as Timestamp;
      tabs.push({
        id: doc.id,
        ...data,
        createdAt: createdAtTimestamp
          ? createdAtTimestamp.toDate()
          : new Date(),
      } as OpenTab);
    });
    callback(
      tabs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  });
};

export const closeOpenTab = async (tab: OpenTab, amountPaid: number) => {
  await runTransaction(db, async (transaction) => {
    const tabRef = doc(db, "openTabs", tab.id!);
    transaction.delete(tabRef);

    const transactionRef = doc(collection(db, "transactions"));
    const newTransactionData: Omit<Transaction, "id"> = {
      items: tab.items,
      totalAmount: tab.totalAmount,
      paymentMethod: "Tunai",
      amountPaid,
      change: amountPaid - tab.totalAmount,
      createdAt: new Date(),
    };
    transaction.set(transactionRef, {
      ...newTransactionData,
      createdAt: serverTimestamp(),
    });
  });
};
