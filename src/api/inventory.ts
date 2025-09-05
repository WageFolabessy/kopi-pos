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
    console.error("Error adding ingredient: ", error);
    throw error;
  }
};

export const getIngredients = (
  callback: (ingredients: Ingredient[]) => void
) => {
  const q = query(collection(db, INVENTORY_COLLECTION));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const ingredients: Ingredient[] = [];
    querySnapshot.forEach((doc) => {
      ingredients.push({ id: doc.id, ...doc.data() } as Ingredient);
    });
    callback(ingredients);
  });
  return unsubscribe;
};

export const updateIngredient = async (
  id: string,
  data: Partial<Ingredient>
) => {
  try {
    const ingredientRef = doc(db, INVENTORY_COLLECTION, id);
    await updateDoc(ingredientRef, data);
  } catch (error) {
    console.error("Error updating ingredient: ", error);
    throw error;
  }
};

export const deleteIngredient = async (id: string) => {
  try {
    await deleteDoc(doc(db, INVENTORY_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting ingredient: ", error);
    throw error;
  }
};
