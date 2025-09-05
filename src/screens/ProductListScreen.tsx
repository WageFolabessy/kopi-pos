import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { deleteProduct, getProducts } from "../api/products";
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

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/80" }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardPrice}>
          Rp {item.price.toLocaleString("id-ID")}
        </Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => item.id && handleEditProduct(item.id)}
        >
          <FontAwesome name="pencil" size={18} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => item.id && handleDeleteProduct(item.id)}
        >
          <FontAwesome name="trash" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id ?? Math.random().toString()}
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Belum ada produk.</Text>
      }
    />
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
  card: {
    backgroundColor: "white",
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardPrice: {
    fontSize: 16,
    color: "green",
    marginVertical: 4,
  },
  cardCategory: {
    fontSize: 14,
    color: "gray",
    fontStyle: "italic",
  },
  cardActions: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 25,
    marginBottom: 10,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProductListScreen;
