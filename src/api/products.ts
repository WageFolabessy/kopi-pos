import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Product } from "../types";
import { db, storage } from "./firebase";

const PRODUCTS_COLLECTION = "products";

export const uploadImage = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const filename = `products/${Date.now()}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
};

export const addProduct = async (product: Omit<Product, "id">) => {
  try {
    await addDoc(collection(db, PRODUCTS_COLLECTION), product);
  } catch (error) {
    console.error("Error adding product: ", error);
  }
};

export const getProducts = (callback: (products: Product[]) => void) => {
  const q = query(collection(db, PRODUCTS_COLLECTION));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    callback(products);
  });
  return unsubscribe;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, product);
  } catch (error) {
    console.error("Error updating product: ", error);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting product: ", error);
  }
};
