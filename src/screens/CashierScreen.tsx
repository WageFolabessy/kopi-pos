import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { getProducts } from "../api/products";
import { CartItem, Modifier, Product, Variant } from "../types";

import Cart from "../components/cashier/Cart";
import OptionsModal from "../components/cashier/OptionsModal";
import ProductGrid from "../components/cashier/ProductGrid";

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
    if (selectedVariant) singleItemPrice += selectedVariant.priceAdjustment;
    const modifiersPrice =
      selectedModifiers?.reduce((sum, m) => sum + m.priceAdjustment, 0) || 0;
    singleItemPrice += modifiersPrice;

    setCart((prevCart) => {
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
        const newCartItem: CartItem = {
          product,
          quantity: 1,
          totalPrice: singleItemPrice,
          selectedVariant,
          selectedModifiers,
        };
        return [...prevCart, newCartItem];
      }
    });
    setSelectedProduct(null); // Close modal after confirm
  };

  const handleUpdateQuantity = (cartItemIndex: number, amount: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item, index) => {
          if (index === cartItemIndex) {
            const newQuantity = item.quantity + amount;
            if (newQuantity <= 0) return null;

            let singleItemPrice = item.product.price;
            if (item.selectedVariant)
              singleItemPrice += item.selectedVariant.priceAdjustment;
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

  const handleClearCart = () => {
    Alert.alert(
      "Kosongkan Keranjang",
      "Apakah Anda yakin ingin menghapus semua item dari keranjang?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Hapus", style: "destructive", onPress: () => setCart([]) },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <OptionsModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={handleConfirmAddToCart}
      />
      <ProductGrid products={products} onProductSelect={handleProductSelect} />
      <Cart
        cart={cart}
        onClearCart={handleClearCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#f0f2f5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default CashierScreen;
