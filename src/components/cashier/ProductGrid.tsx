import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Product } from "../../types";

const CategoryTabs: React.FC<{
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}> = ({ categories, activeCategory, onSelect }) => (
  <View style={styles.categoryContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            activeCategory === category && styles.categoryButtonActive,
          ]}
          onPress={() => onSelect(category)}
        >
          <Text
            style={[
              styles.categoryText,
              activeCategory === category && styles.categoryTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

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

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  categories: string[];
  activeCategory: string;
  onCategorySelect: (category: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductSelect,
  categories,
  activeCategory,
  onCategorySelect,
}) => {
  return (
    <View style={styles.container}>
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={onCategorySelect}
      />
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
  categoryContainer: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: "#f0f0f0",
  },
  categoryButtonActive: {
    backgroundColor: "#007bff",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  categoryTextActive: {
    color: "white",
    fontWeight: "bold",
  },
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
