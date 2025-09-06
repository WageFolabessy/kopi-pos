import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../../types";

interface ProductCardProps {
  item: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUrl || "https://placehold.co/80x80" }}
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
          {item.recipe && item.recipe.length > 0 && (
            <Text style={[styles.badge, styles.badgeRecipe]}>+ Resep</Text>
          )}
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => item.id && onEdit(item.id)}
        >
          <FontAwesome name="pencil" size={18} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => item.id && onDelete(item.id)}
        >
          <FontAwesome name="trash" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Gunakan React.memo untuk optimalisasi ---
export default React.memo(ProductCard);

const styles = StyleSheet.create({
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
  optionBadges: {
    flexDirection: "row",
    marginTop: 6,
    flexWrap: "wrap",
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
    marginBottom: 4,
  },
  badgeRecipe: {
    backgroundColor: "#17a2b8",
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
