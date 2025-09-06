import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { Ingredient } from "../types";
import { db } from "./firebase";

const INVENTORY_COLLECTION = "inventory";

export const addIngredient = async (ingredient: Omit<Ingredient, "id">) => {
  try {
    await addDoc(collection(db, INVENTORY_COLLECTION), ingredient);
  } catch (error) {
    throw new Error("Gagal menambahkan bahan baku baru.");
  }
};

export const getIngredients = (
  callback: (ingredients: Ingredient[]) => void
) => {
  const q = query(collection(db, INVENTORY_COLLECTION));
  return onSnapshot(
    q,
    (querySnapshot) => {
      const ingredients: Ingredient[] = [];
      querySnapshot.forEach((doc) => {
        ingredients.push({ id: doc.id, ...doc.data() } as Ingredient);
      });
      callback(ingredients);
    },
    (error) => {
      console.error("Gagal mengambil data inventori: ", error);
      throw new Error("Gagal mengambil data inventori.");
    }
  );
};

export const updateIngredient = async (
  id: string,
  ingredient: Partial<Ingredient>
) => {
  try {
    const ingredientRef = doc(db, INVENTORY_COLLECTION, id);
    await updateDoc(ingredientRef, ingredient);
  } catch (error) {
    throw new Error("Gagal memperbarui bahan baku.");
  }
};

export const deleteIngredient = async (id: string) => {
  try {
    await deleteDoc(doc(db, INVENTORY_COLLECTION, id));
  } catch (error) {
    throw new Error("Gagal menghapus bahan baku.");
  }
};
