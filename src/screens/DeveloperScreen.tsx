import {
    addDoc,
    collection,
    doc,
    getDocs,
    writeBatch,
} from "firebase/firestore";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { db } from "../api/firebase";
import { uploadImage } from "../api/products";
import { Ingredient, Product, RecipeItem } from "../types";

const INGREDIENTS_DATA: Omit<Ingredient, "id">[] = [
  { name: "Biji Kopi Arabika", stock: 5000, unit: "gram", minStock: 500 },
  { name: "Biji Kopi Robusta", stock: 5000, unit: "gram", minStock: 500 },
  { name: "Susu Full Cream", stock: 20000, unit: "ml", minStock: 1000 },
  { name: "Susu Oat", stock: 5000, unit: "ml", minStock: 500 },
  { name: "Gula Aren Cair", stock: 5000, unit: "ml", minStock: 500 },
  { name: "Sirup Karamel", stock: 2000, unit: "ml", minStock: 200 },
  { name: "Sirup Vanila", stock: 2000, unit: "ml", minStock: 200 },
  { name: "Sirup Pandan", stock: 2000, unit: "ml", minStock: 200 },
  { name: "Susu Kental Manis", stock: 3000, unit: "ml", minStock: 300 },
  { name: "Bubuk Teh Hitam", stock: 1000, unit: "gram", minStock: 100 },
  { name: "Bubuk Coklat", stock: 2000, unit: "gram", minStock: 200 },
  { name: "Bubuk Matcha", stock: 1000, unit: "gram", minStock: 100 },
  { name: "Bubuk Red Velvet", stock: 1000, unit: "gram", minStock: 100 },
  { name: "Buah Lemon", stock: 100, unit: "pcs", minStock: 10 },
  { name: "Buah Leci Kaleng", stock: 5000, unit: "gram", minStock: 500 },
  { name: "Es Batu", stock: 50000, unit: "gram", minStock: 5000 },
  { name: "Roti Tawar", stock: 100, unit: "pcs", minStock: 20 },
  { name: "Kentang Beku", stock: 10000, unit: "gram", minStock: 1000 },
  { name: "Pisang", stock: 50, unit: "pcs", minStock: 10 },
  { name: "Sosis Sapi", stock: 100, unit: "pcs", minStock: 20 },
  { name: "Mie Instan", stock: 200, unit: "pcs", minStock: 40 },
  { name: "Telur Ayam", stock: 100, unit: "pcs", minStock: 20 },
  { name: "Keju Cheddar", stock: 2000, unit: "gram", minStock: 200 },
  { name: "Selai Coklat", stock: 2000, unit: "gram", minStock: 200 },
  { name: "Minyak Goreng", stock: 10000, unit: "ml", minStock: 1000 },
];

const placeholderUrl = (name: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(name)}/800`;

const PRODUCTS_DATA: Omit<Product, "id" | "recipe" | "imageUrl">[] = [
  {
    name: "Espresso",
    price: 15000,
    category: "Kopi",
    variants: [
      { name: "Single", priceAdjustment: 0 },
      { name: "Double", priceAdjustment: 5000 },
    ],
  },
  {
    name: "Americano",
    price: 18000,
    category: "Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  {
    name: "Kopi Susu Gula Aren",
    price: 22000,
    category: "Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
    modifiers: [
      { name: "Extra Shot", priceAdjustment: 5000 },
      { name: "Ganti Susu Oat", priceAdjustment: 4000 },
    ],
  },
  {
    name: "Caffe Latte",
    price: 20000,
    category: "Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  {
    name: "Cappuccino",
    price: 20000,
    category: "Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  {
    name: "Caramel Macchiato",
    price: 25000,
    category: "Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  {
    name: "Kopi Pandan",
    price: 23000,
    category: "Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  {
    name: "Vietnam Drip",
    price: 20000,
    category: "Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  { name: "V60 Manual Brew", price: 28000, category: "Kopi" },
  { name: "Japanese Iced Coffee", price: 30000, category: "Kopi" },
  {
    name: "Coklat Signature",
    price: 22000,
    category: "Non-Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  {
    name: "Matcha Latte",
    price: 24000,
    category: "Non-Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  {
    name: "Red Velvet Latte",
    price: 24000,
    category: "Non-Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  {
    name: "Teh Tarik",
    price: 18000,
    category: "Non-Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  {
    name: "Lemon Tea",
    price: 15000,
    category: "Non-Kopi",
    variants: [
      { name: "Panas", priceAdjustment: 0 },
      { name: "Dingin", priceAdjustment: 2000 },
    ],
  },
  { name: "Lychee Tea", price: 18000, category: "Non-Kopi" },
  { name: "Air Mineral", price: 5000, category: "Non-Kopi" },
  { name: "Es Teh Manis", price: 8000, category: "Non-Kopi" },
  { name: "Jus Jeruk", price: 15000, category: "Non-Kopi" },
  { name: "Soda Gembira", price: 17000, category: "Non-Kopi" },
  { name: "Roti Bakar Coklat Keju", price: 18000, category: "Makanan" },
  { name: "Kentang Goreng", price: 15000, category: "Makanan" },
  { name: "Pisang Goreng Keju", price: 16000, category: "Makanan" },
  { name: "Sosis Bakar", price: 12000, category: "Makanan" },
  { name: "Indomie Goreng Special", price: 15000, category: "Makanan" },
  { name: "Nasi Goreng Kampung", price: 20000, category: "Makanan" },
  { name: "Sandwich Daging Asap", price: 25000, category: "Makanan" },
  { name: "Dimsum Ayam", price: 18000, category: "Makanan" },
  { name: "Donat Gula", price: 8000, category: "Makanan" },
  { name: "Singkong Goreng", price: 12000, category: "Makanan" },
];

const DeveloperScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSeedDatabase = async () => {
    Alert.alert(
      "Konfirmasi Seeding",
      "Proses ini akan MENGHAPUS semua produk dan inventori lama. Apakah Anda yakin ingin melanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Lanjutkan",
          style: "destructive",
          onPress: runSeedingProcess,
        },
      ]
    );
  };

  const runSeedingProcess = async () => {
    setLoading(true);
    try {
      await clearCollection("inventory");
      await clearCollection("products");

      const ingredientIdMap = new Map<string, Ingredient & { id: string }>();
      for (const ingredientData of INGREDIENTS_DATA) {
        const docRef = await addDoc(
          collection(db, "inventory"),
          ingredientData
        );
        ingredientIdMap.set(ingredientData.name, {
          ...ingredientData,
          id: docRef.id,
        });
      }

      const uploadPromises = PRODUCTS_DATA.map((p) =>
        uploadImage(placeholderUrl(p.name), "image/jpeg")
      );
      const imageUrls = await Promise.all(uploadPromises);

      const productsWithImages = PRODUCTS_DATA.map((p, index) => ({
        ...p,
        imageUrl: imageUrls[index],
      }));

      const createRecipe = (
        items: { name: string; qty: number }[]
      ): RecipeItem[] => {
        return items.map((item) => {
          const ing = ingredientIdMap.get(item.name);
          if (!ing) throw new Error(`Bahan baku tidak ditemukan: ${item.name}`);
          return {
            ingredientId: ing.id,
            ingredientName: ing.name,
            quantity: item.qty,
            unit: ing.unit,
          };
        });
      };

      const productsWithRecipes = productsWithImages.map((p) => {
        let recipe: RecipeItem[] = [];
        try {
          switch (p.name) {
            case "Espresso":
              recipe = createRecipe([{ name: "Biji Kopi Arabika", qty: 15 }]);
              break;
            case "Americano":
              recipe = createRecipe([{ name: "Biji Kopi Arabika", qty: 15 }]);
              break;
            case "Kopi Susu Gula Aren":
              recipe = createRecipe([
                { name: "Biji Kopi Arabika", qty: 15 },
                { name: "Susu Full Cream", qty: 120 },
                { name: "Gula Aren Cair", qty: 20 },
              ]);
              break;
            case "Caffe Latte":
              recipe = createRecipe([
                { name: "Biji Kopi Arabika", qty: 15 },
                { name: "Susu Full Cream", qty: 150 },
              ]);
              break;
            case "Cappuccino":
              recipe = createRecipe([
                { name: "Biji Kopi Arabika", qty: 15 },
                { name: "Susu Full Cream", qty: 120 },
              ]);
              break;
            case "Caramel Macchiato":
              recipe = createRecipe([
                { name: "Biji Kopi Arabika", qty: 15 },
                { name: "Susu Full Cream", qty: 120 },
                { name: "Sirup Karamel", qty: 20 },
              ]);
              break;
            case "Kopi Pandan":
              recipe = createRecipe([
                { name: "Biji Kopi Arabika", qty: 15 },
                { name: "Susu Full Cream", qty: 120 },
                { name: "Sirup Pandan", qty: 20 },
              ]);
              break;
            case "Vietnam Drip":
              recipe = createRecipe([
                { name: "Biji Kopi Robusta", qty: 20 },
                { name: "Susu Kental Manis", qty: 30 },
              ]);
              break;
            case "V60 Manual Brew":
              recipe = createRecipe([{ name: "Biji Kopi Arabika", qty: 18 }]);
              break;
            case "Japanese Iced Coffee":
              recipe = createRecipe([
                { name: "Biji Kopi Arabika", qty: 18 },
                { name: "Es Batu", qty: 150 },
              ]);
              break;
            case "Coklat Signature":
              recipe = createRecipe([
                { name: "Bubuk Coklat", qty: 30 },
                { name: "Susu Full Cream", qty: 150 },
              ]);
              break;
            case "Matcha Latte":
              recipe = createRecipe([
                { name: "Bubuk Matcha", qty: 10 },
                { name: "Susu Full Cream", qty: 150 },
              ]);
              break;
            case "Red Velvet Latte":
              recipe = createRecipe([
                { name: "Bubuk Red Velvet", qty: 25 },
                { name: "Susu Full Cream", qty: 150 },
              ]);
              break;
            case "Teh Tarik":
              recipe = createRecipe([
                { name: "Bubuk Teh Hitam", qty: 10 },
                { name: "Susu Kental Manis", qty: 30 },
              ]);
              break;
            case "Lemon Tea":
              recipe = createRecipe([
                { name: "Bubuk Teh Hitam", qty: 5 },
                { name: "Buah Lemon", qty: 1 },
              ]);
              break;
            case "Lychee Tea":
              recipe = createRecipe([
                { name: "Bubuk Teh Hitam", qty: 5 },
                { name: "Buah Leci Kaleng", qty: 50 },
              ]);
              break;
            case "Roti Bakar Coklat Keju":
              recipe = createRecipe([
                { name: "Roti Tawar", qty: 2 },
                { name: "Selai Coklat", qty: 30 },
                { name: "Keju Cheddar", qty: 20 },
              ]);
              break;
            case "Kentang Goreng":
              recipe = createRecipe([
                { name: "Kentang Beku", qty: 150 },
                { name: "Minyak Goreng", qty: 50 },
              ]);
              break;
            case "Pisang Goreng Keju":
              recipe = createRecipe([
                { name: "Pisang", qty: 1 },
                { name: "Keju Cheddar", qty: 20 },
              ]);
              break;
            case "Sosis Bakar":
              recipe = createRecipe([{ name: "Sosis Sapi", qty: 1 }]);
              break;
            case "Indomie Goreng Special":
              recipe = createRecipe([
                { name: "Mie Instan", qty: 1 },
                { name: "Telur Ayam", qty: 1 },
              ]);
              break;
          }
        } catch (e) {
          console.warn(
            `Could not create recipe for ${p.name}: ${(e as Error).message}`
          );
        }
        return { ...p, recipe };
      });

      const productBatch = writeBatch(db);
      productsWithRecipes.forEach((productData) => {
        const docRef = doc(collection(db, "products"));
        productBatch.set(docRef, productData);
      });
      await productBatch.commit();

      Alert.alert(
        "Sukses",
        "Database berhasil diisi dengan 30 produk dan 25+ bahan baku."
      );
    } catch (error) {
      Alert.alert("Error", "Gagal melakukan seeding database.");
    } finally {
      setLoading(false);
    }
  };

  const clearCollection = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Halaman Developer</Text>
      <Text style={styles.description}>
        Gunakan tombol di bawah ini untuk mengisi database dengan data awal
        untuk keperluan testing.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Isi Database (Seed)" onPress={handleSeedDatabase} />
        </View>
      )}

      <Text style={styles.warning}>
        PERINGATAN: Menekan tombol ini akan MENGHAPUS semua data produk dan
        inventori yang ada, lalu menggantinya dengan data dummy.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#555",
  },
  buttonContainer: {
    width: "80%",
    marginVertical: 10,
  },
  warning: {
    fontSize: 12,
    textAlign: "center",
    color: "#dc3545",
    marginTop: 40,
    fontStyle: "italic",
  },
});

export default DeveloperScreen;
