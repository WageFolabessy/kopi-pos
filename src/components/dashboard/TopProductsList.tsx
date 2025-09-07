import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TopProduct } from "../../types";

interface TopProductsListProps {
  products: TopProduct[];
}

const TopProductsList: React.FC<TopProductsListProps> = ({ products }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Produk Terlaris Hari Ini</Text>
      {products.length === 0 ? (
        <Text style={styles.emptyText}>Belum ada penjualan hari ini.</Text>
      ) : (
        products.map((product, index) => (
          <View key={product.id} style={styles.item}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.quantity}>{product.quantity}x</Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "gray",
    width: 30,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
    padding: 20,
  },
});

export default TopProductsList;
