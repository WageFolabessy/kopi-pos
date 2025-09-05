import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { CartItem } from "../../types";

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (index: number, amount: number) => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, onUpdateQuantity, onClearCart }) => {
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const renderCartItem = ({
    item,
    index,
  }: {
    item: CartItem;
    index: number;
  }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.product.name}</Text>
        {item.selectedVariant && (
          <Text style={styles.cartItemOption}>
            - {item.selectedVariant.name}
          </Text>
        )}
        {item.selectedModifiers?.map((m) => (
          <Text key={m.name} style={styles.cartItemOption}>
            - {m.name}
          </Text>
        ))}
        <Text style={styles.cartItemPrice}>
          Rp {item.totalPrice.toLocaleString("id-ID")}
        </Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => onUpdateQuantity(index, -1)}>
          <FontAwesome name="minus-circle" size={24} color="#dc3545" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => onUpdateQuantity(index, 1)}>
          <FontAwesome name="plus-circle" size={24} color="#28a745" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.cartContainer}>
      <View style={styles.cartHeader}>
        <Text style={styles.cartTitle}>Pesanan</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={onClearCart}>
            <FontAwesome name="trash-o" size={24} color="#dc3545" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item, index) =>
          `${item.product.id}-${index}-${item.selectedVariant?.name}`
        }
        ListEmptyComponent={
          <Text style={styles.emptyCartText}>Keranjang kosong</Text>
        }
      />
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total</Text>
          <Text style={styles.summaryTotal}>
            Rp {calculateTotal().toLocaleString("id-ID")}
          </Text>
        </View>
        <TouchableOpacity style={styles.payButton} disabled={cart.length === 0}>
          <Text style={styles.payButtonText}>Bayar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cartContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cartTitle: { fontSize: 22, fontWeight: "bold" },
  emptyCartText: { textAlign: "center", color: "gray", marginTop: 20 },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cartItemInfo: { flex: 1, marginRight: 8 },
  cartItemName: { fontSize: 16, fontWeight: "500" },
  cartItemOption: { fontSize: 12, color: "gray", marginLeft: 8 },
  cartItemPrice: { fontSize: 14, color: "#555", marginTop: 4 },
  quantityContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 25,
    textAlign: "center",
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 16,
    marginTop: "auto",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryText: { fontSize: 18, color: "gray" },
  summaryTotal: { fontSize: 20, fontWeight: "bold" },
  payButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  payButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default Cart;
