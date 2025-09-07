import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { CartItem, Transaction } from "../types";
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

export const getTransactions = (
  callback: (transactions: Transaction[]) => void
) => {
  const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAtTimestamp = data.createdAt as Timestamp;
      transactions.push({
        id: doc.id,
        ...data,
        createdAt: createdAtTimestamp
          ? createdAtTimestamp.toDate()
          : new Date(),
      } as Transaction);
    });
    callback(transactions);
  });
};

export const getTransactionById = async (
  id: string
): Promise<Transaction | null> => {
  const docRef = doc(db, "transactions", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const createdAtTimestamp = data.createdAt as Timestamp;
    return {
      id: docSnap.id,
      ...data,
      createdAt: createdAtTimestamp ? createdAtTimestamp.toDate() : new Date(),
    } as Transaction;
  }
  return null;
};

export const getTodaysTransactions = (
  callback: (transactions: Transaction[]) => void
) => {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  const q = query(
    collection(db, "transactions"),
    where("createdAt", ">=", startOfDay),
    where("createdAt", "<=", endOfDay)
  );

  return onSnapshot(q, (querySnapshot) => {
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAtTimestamp = data.createdAt as Timestamp;
      transactions.push({
        id: doc.id,
        ...data,
        createdAt: createdAtTimestamp
          ? createdAtTimestamp.toDate()
          : new Date(),
      } as Transaction);
    });
    callback(transactions);
  });
};
