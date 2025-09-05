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
  View,
} from "react-native";
import { db } from "../api/firebase";
import { addProduct, updateProduct, uploadImage } from "../api/products";
import { Product } from "../types";

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

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory("Kopi");
    setImageUri(null);
  };

  useEffect(() => {
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
        }
      } else {
        resetForm();
      }
      setInitialLoading(false);
    };
    fetchProductData();
  }, [params.productId]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
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
        uploadedImageUrl = await uploadImage(imageUri);
      }

      if (isEditing && params.productId) {
        const updatedData: Partial<Product> = {
          name,
          price: productPrice,
          category,
          imageUrl: uploadedImageUrl,
        };
        await updateProduct(params.productId, updatedData);
        Alert.alert("Sukses", "Produk berhasil diperbarui.");
      } else {
        const newProduct: Omit<Product, "id"> = {
          name,
          price: productPrice,
          category,
          imageUrl: uploadedImageUrl,
        };
        await addProduct(newProduct);
        Alert.alert("Sukses", "Produk baru berhasil ditambahkan.");
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan produk.");
      console.log(error)
    } finally {
      setLoading(false);
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
        options={{
          title: isEditing ? "Ubah Produk" : "Tambah Produk",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16 }}
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

          <Text style={styles.label}>Harga</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  formContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
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
    marginBottom: 24,
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
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#aaa",
  },
  submitButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProductFormScreen;
