import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../api/firebase";
import { getIngredients } from "../api/inventory";
import { addProduct, updateProduct, uploadImage } from "../api/products";
import OptionInput from "../components/products/OptionInput";
import RecipeInput from "../components/products/RecipeInput";
import { Ingredient, Modifier, Product, RecipeItem, Variant } from "../types";

const ProductFormScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ productId?: string }>();
  const isEditing = !!params.productId;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"Kopi" | "Non-Kopi" | "Makanan">(
    "Kopi"
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribeIngredients = getIngredients(setAvailableIngredients);
    const fetchProductData = async () => {
      setInitialLoading(true);
      if (params.productId) {
        const docRef = doc(db, "products", params.productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = docSnap.data() as Product;
          setName(productData.name);
          setPrice(productData.price.toString());
          setCategory(productData.category);
          setImageUri(productData.imageUrl || null);
          setVariants(productData.variants || []);
          setModifiers(productData.modifiers || []);
          setRecipe(productData.recipe || []);
        }
      } else {
        setName("");
        setPrice("");
        setCategory("Kopi");
        setImageUri(null);
        setVariants([]);
        setModifiers([]);
        setRecipe([]);
      }
      setInitialLoading(false);
    };
    fetchProductData();
    return () => unsubscribeIngredients();
  }, [params.productId]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageMimeType(result.assets[0].mimeType || "image/jpeg");
    }
  };

  const handleFormSubmit = async () => {
    const productPrice = parseFloat(price);
    if (!name || isNaN(productPrice) || productPrice <= 0) {
      Alert.alert("Error", "Nama dan Harga produk tidak valid.");
      return;
    }
    if (!isEditing && !imageUri) {
      Alert.alert("Error", "Silakan pilih foto untuk produk baru.");
      return;
    }
    setLoading(true);
    try {
      let uploadedImageUrl = imageUri || "";
      if (imageUri && imageUri.startsWith("file://")) {
        uploadedImageUrl = await uploadImage(imageUri, imageMimeType);
      }
      const productData = {
        name,
        price: productPrice,
        category,
        imageUrl: uploadedImageUrl,
        variants,
        modifiers,
        recipe,
      };
      if (isEditing && params.productId) {
        await updateProduct(params.productId, productData);
        Alert.alert("Sukses", "Produk berhasil diperbarui.");
      } else {
        await addProduct(productData);
        Alert.alert("Sukses", "Produk baru berhasil ditambahkan.");
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredientToRecipe = (
    ingredientId: string,
    quantity: number
  ) => {
    const ingredient = availableIngredients.find((i) => i.id === ingredientId);
    if (ingredient && quantity > 0) {
      if (recipe.some((item) => item.ingredientId === ingredientId)) {
        Alert.alert("Info", "Bahan ini sudah ada di dalam resep.");
        return;
      }
      const newRecipeItem: RecipeItem = {
        ingredientId: ingredient.id!,
        ingredientName: ingredient.name,
        quantity,
        unit: ingredient.unit,
      };
      setRecipe([...recipe, newRecipeItem]);
    }
  };

  if (initialLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: isEditing ? "Ubah Produk" : "Tambah Produk" }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handleImagePick}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <FontAwesome name="camera" size={32} color="#aaa" />
                <Text style={styles.imagePlaceholderText}>Pilih Foto</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.label}>Nama Produk</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.label}>Harga Dasar</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
              <Picker.Item label="Kopi" value="Kopi" />
              <Picker.Item label="Non-Kopi" value="Non-Kopi" />
              <Picker.Item label="Makanan" value="Makanan" />
            </Picker>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Varian (Contoh: Panas, Dingin)
          </Text>
          {variants.map((variant, index) => (
            <View key={index} style={styles.optionItem}>
              <Text>
                {variant.name} (Rp{" "}
                {variant.priceAdjustment.toLocaleString("id-ID")})
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setVariants(variants.filter((_, i) => i !== index))
                }
              >
                <FontAwesome name="trash" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          <OptionInput
            title="Varian"
            onAdd={(name, price) =>
              setVariants([...variants, { name, priceAdjustment: price }])
            }
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Modifier (Contoh: Extra Shot)</Text>
          {modifiers.map((modifier, index) => (
            <View key={index} style={styles.optionItem}>
              <Text>
                {modifier.name} (+Rp{" "}
                {modifier.priceAdjustment.toLocaleString("id-ID")})
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setModifiers(modifiers.filter((_, i) => i !== index))
                }
              >
                <FontAwesome name="trash" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          <OptionInput
            title="Modifier"
            onAdd={(name, price) =>
              setModifiers([...modifiers, { name, priceAdjustment: price }])
            }
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Resep (Bahan Baku)</Text>
          {recipe.map((item, index) => (
            <View key={index} style={styles.optionItem}>
              <Text>
                {item.ingredientName} ({item.quantity} {item.unit})
              </Text>
              <TouchableOpacity
                onPress={() => setRecipe(recipe.filter((_, i) => i !== index))}
              >
                <FontAwesome name="trash" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          <RecipeInput
            ingredients={availableIngredients}
            onAdd={handleAddIngredientToRecipe}
          />
        </View>

        <View style={styles.submitSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleFormSubmit}
            >
              <Text style={styles.submitButtonText}>
                {isEditing ? "Simpan Perubahan" : "Tambah Produk"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  formContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
  },
  sectionContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  label: { fontSize: 16, fontWeight: "600", color: "#444", marginBottom: 8 },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  pickerContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    height: Platform.OS === "ios" ? 120 : 60,
    overflow: "hidden",
  },
  imagePicker: {
    height: 140,
    width: 140,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#eee",
    borderStyle: "dashed",
  },
  imagePreview: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center" },
  imagePlaceholderText: { marginTop: 8, color: "#aaa" },
  submitSection: { paddingHorizontal: 16, paddingTop: 16 },
  submitButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default ProductFormScreen;
