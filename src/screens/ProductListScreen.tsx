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
        <View style={styles.optionBadges}>
          {item.variants && item.variants.length > 0 && (
            <Text style={styles.badge}>+ Varian</Text>
          )}
          {item.modifiers && item.modifiers.length > 0 && (
            <Text style={styles.badge}>+ Modifier</Text>
          )}
        </View>
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
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
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
    justifyContent: "center",
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
  optionBadges: {
    flexDirection: "row",
    marginTop: 6,
  },
  badge: {
    fontSize: 10,
    color: "white",
    backgroundColor: "#6c757d",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    overflow: "hidden",
  },
});

export default ProductListScreen;
