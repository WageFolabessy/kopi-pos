import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getProducts } from "../api/products";
import { CartItem, Modifier, Product, Variant } from "../types";

// --- Options Modal Component ---
interface OptionsModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    product: Product,
    selectedVariant?: Variant,
    selectedModifiers?: Modifier[]
  ) => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({
  product,
  visible,
  onClose,
  onConfirm,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    undefined
  );
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);

  useEffect(() => {
    // Reset state when a new product is selected
    if (product) {
      setSelectedVariant(product.variants?.[0]);
      setSelectedModifiers([]);
    }
  }, [product]);

  if (!product) return null;

  const handleModifierToggle = (modifier: Modifier) => {
    setSelectedModifiers((prev) =>
      prev.find((m) => m.name === modifier.name)
        ? prev.filter((m) => m.name !== modifier.name)
        : [...prev, modifier]
    );
  };

  const handleConfirm = () => {
    onConfirm(product, selectedVariant, selectedModifiers);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{product.name}</Text>

          {/* Variants Section */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Pilih Varian (wajib)</Text>
              {product.variants.map((variant) => (
                <TouchableOpacity
                  key={variant.name}
                  style={[
                    styles.optionButton,
                    selectedVariant?.name === variant.name &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedVariant(variant)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedVariant?.name === variant.name &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {variant.name} (Rp{" "}
                    {variant.priceAdjustment.toLocaleString("id-ID")})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Modifiers Section */}
          {product.modifiers && product.modifiers.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Pilih Modifier (opsional)</Text>
              {product.modifiers.map((modifier) => (
                <TouchableOpacity
                  key={modifier.name}
                  style={[
                    styles.optionButton,
                    selectedModifiers.find((m) => m.name === modifier.name) &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => handleModifierToggle(modifier)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedModifiers.find((m) => m.name === modifier.name) &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {modifier.name} (+Rp{" "}
                    {modifier.priceAdjustment.toLocaleString("id-ID")})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Konfirmasi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Main CashierScreen Component ---
const CashierScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribe = getProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleProductSelect = (product: Product) => {
    // If product has options, open modal. Otherwise, add directly to cart.
    if (
      (product.variants && product.variants.length > 0) ||
      (product.modifiers && product.modifiers.length > 0)
    ) {
      setSelectedProduct(product);
    } else {
      handleConfirmAddToCart(product);
    }
  };

  const handleConfirmAddToCart = (
    product: Product,
    selectedVariant?: Variant,
    selectedModifiers?: Modifier[]
  ) => {
    let singleItemPrice = product.price;
    if (selectedVariant) {
      singleItemPrice += selectedVariant.priceAdjustment;
    }
    const modifiersPrice =
      selectedModifiers?.reduce((sum, m) => sum + m.priceAdjustment, 0) || 0;
    singleItemPrice += modifiersPrice;

    setCart((prevCart) => {
      // --- PERBAIKAN: Cek apakah item dengan konfigurasi yang sama sudah ada ---
      const existingCartItemIndex = prevCart.findIndex((item) => {
        const isSameProduct = item.product.id === product.id;
        const isSameVariant =
          item.selectedVariant?.name === selectedVariant?.name;

        const currentModifiers =
          item.selectedModifiers?.map((m) => m.name).sort() || [];
        const newModifiers = selectedModifiers?.map((m) => m.name).sort() || [];

        const isSameModifiers =
          currentModifiers.length === newModifiers.length &&
          currentModifiers.every((mod, index) => mod === newModifiers[index]);

        return isSameProduct && isSameVariant && isSameModifiers;
      });

      if (existingCartItemIndex > -1) {
        // --- Jika item ada, perbarui kuantitas dan total harga ---
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingCartItemIndex];
        const newQuantity = existingItem.quantity + 1;

        updatedCart[existingCartItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: newQuantity * singleItemPrice,
        };
        return updatedCart;
      } else {
        // --- Jika item belum ada, tambahkan sebagai item baru ---
        const newCartItem: CartItem = {
          product: product,
          quantity: 1,
          totalPrice: singleItemPrice,
          selectedVariant,
          selectedModifiers,
        };
        return [...prevCart, newCartItem];
      }
    });
  };

  const handleUpdateQuantity = (cartItemIndex: number, amount: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item, index) => {
          if (index === cartItemIndex) {
            const newQuantity = item.quantity + amount;
            if (newQuantity <= 0) return null;

            let singleItemPrice = item.product.price;
            if (item.selectedVariant) {
              singleItemPrice += item.selectedVariant.priceAdjustment;
            }
            const modifiersPrice =
              item.selectedModifiers?.reduce(
                (sum, m) => sum + m.priceAdjustment,
                0
              ) || 0;
            singleItemPrice += modifiersPrice;

            return {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * singleItemPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductSelect(item)}
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
        <TouchableOpacity onPress={() => handleUpdateQuantity(index, -1)}>
          <FontAwesome name="minus-circle" size={24} color="#dc3545" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => handleUpdateQuantity(index, 1)}>
          <FontAwesome name="plus-circle" size={24} color="#28a745" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <OptionsModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={handleConfirmAddToCart}
      />

      <View style={styles.productListContainer}>
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id!}
          numColumns={3}
          contentContainerStyle={{ padding: 8 }}
        />
      </View>

      <View style={styles.cartContainer}>
        <Text style={styles.cartTitle}>Pesanan</Text>
        <FlatList
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={(item, index) => `${item.product.id}-${index}`}
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
          <TouchableOpacity
            style={styles.payButton}
            disabled={cart.length === 0}
          >
            <Text style={styles.payButtonText}>Bayar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#f0f2f5" },
  productListContainer: { flex: 2 },
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
  cartContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
  },
  cartTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
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
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  optionSection: { marginBottom: 20 },
  optionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  optionButtonSelected: { backgroundColor: "#007bff", borderColor: "#007bff" },
  optionText: { fontSize: 14 },
  optionTextSelected: { color: "white" },
  confirmButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  confirmButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  closeButton: { marginTop: 12, alignItems: "center" },
  closeButtonText: { color: "gray" },
});

export default CashierScreen;
