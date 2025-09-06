import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Product } from "../../types";

const ProductGridItem = React.memo(
  ({
    item,
    onSelect,
  }: {
    item: Product;
    onSelect: (product: Product) => void;
  }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => onSelect(item)}>
      <Image
        source={{ uri: item.imageUrl || "https://placehold.co/80x80" }}
        style={styles.productImage}
      />
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>
        Rp {item.price.toLocaleString("id-ID")}
      </Text>
    </TouchableOpacity>
  )
);

const ProductGrid: React.FC<{
  products: Product[];
  onProductSelect: (product: Product) => void;
}> = ({ products, onProductSelect }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductGridItem item={item} onSelect={onProductSelect} />
        )}
        keyExtractor={(item) => item.id!}
        numColumns={3}
        contentContainerStyle={{ padding: 8 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 2, backgroundColor: "#f9f9f9" },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    height: 34,
  },
  productPrice: {
    fontSize: 14,
    color: "green",
    marginTop: 4,
  },
});

export default ProductGrid;
