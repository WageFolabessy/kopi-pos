import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteProduct, getProducts } from "../api/products";
import ProductCard from "../components/products/ProductCard";
import { Product } from "../types";

const ProductListScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = getProducts(setProducts);
    return () => unsubscribe();
  }, []);

  const handleDeleteProduct = (id: string) => {
    Alert.alert(
      "Hapus Produk",
      "Apakah Anda yakin ingin menghapus produk ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteProduct(id),
        },
      ]
    );
  };

  const handleEditProduct = (productId: string) => {
    router.push({ pathname: "/products/form", params: { productId } });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada produk.</Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/products/form")}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "gray",
  },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 30,
    bottom: 30,
    backgroundColor: "#007bff",
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ProductListScreen;
