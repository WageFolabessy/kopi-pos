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

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductSelect,
}) => {
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onProductSelect(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>
        Rp {item.price.toLocaleString("id-ID")}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id!}
        numColumns={3}
        contentContainerStyle={{ padding: 8 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 2 },
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
  productImage: { width: 80, height: 80, borderRadius: 8, marginBottom: 8 },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    height: 34,
  },
  productPrice: { fontSize: 14, color: "green", marginTop: 4 },
});

export default ProductGrid;
