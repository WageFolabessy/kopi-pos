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

export const uploadImage = (
  uri: string,
  contentType: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const blob = xhr.response;
      const filename = `products/${Date.now()}.${
        contentType.split("/")[1] || "jpeg"
      }`;
      const storageRef = ref(storage, filename);
      const metadata = { contentType };

      uploadBytes(storageRef, blob, metadata)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        })
        .catch((error) => {
          reject(error);
        });
    };
    xhr.onerror = function () {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
};

export const addProduct = async (product: Omit<Product, "id">) => {
  try {
    await addDoc(collection(db, "products"), product);
  } catch (error) {
    throw new Error("Gagal menambahkan produk baru.");
  }
};

export const getProducts = (callback: (products: Product[]) => void) => {
  const q = query(collection(db, "products"));
  return onSnapshot(
    q,
    (querySnapshot) => {
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      callback(products);
    },
    (error) => {
      console.error("Gagal mengambil data produk: ", error);
      throw new Error("Gagal mengambil data produk.");
    }
  );
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  try {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, product);
  } catch (error) {
    throw new Error("Gagal memperbarui produk.");
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (error) {
    throw new Error("Gagal menghapus produk.");
  }
};
