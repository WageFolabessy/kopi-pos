import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { closeOpenTab, createOpenTab } from "../api/openTabs";
import { getProducts } from "../api/products";
import { processTransaction } from "../api/transactions";
import { useCashier } from "../store/CashierContext";
import { CartItem, Modifier, OpenTab, Product, Variant } from "../types";

import Cart from "../components/cashier/Cart";
import OpenTabsModal from "../components/cashier/OpenTabsModal";
import OptionsModal from "../components/cashier/OptionsModal";
import PaymentModal from "../components/cashier/PaymentModal";
import ProductGrid from "../components/cashier/ProductGrid";
import SaveTabModal from "../components/cashier/SaveTabModal";

const CashierScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [saveTabModalVisible, setSaveTabModalVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");

  const { openTabsModalVisible, setOpenTabsModalVisible } = useCashier();
  const [currentOpenTab, setCurrentOpenTab] = useState<OpenTab | null>(null);

  useEffect(() => {
    const unsubscribe = getProducts((data) => {
      setProducts(data);
      const uniqueCategories = [
        "Semua",
        ...Array.from(new Set(data.map((p) => p.category))),
      ];
      setCategories(uniqueCategories);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered =
      activeCategory === "Semua"
        ? products
        : products.filter((p) => p.category === activeCategory);
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, activeCategory]);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

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
    singleItemPrice +=
      selectedModifiers?.reduce((sum, m) => sum + m.priceAdjustment, 0) || 0;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => {
        const isSameProduct = item.product.id === product.id;
        const isSameVariant =
          item.selectedVariant?.name === selectedVariant?.name;
        const currentMods =
          item.selectedModifiers?.map((m) => m.name).sort() || [];
        const newMods = selectedModifiers?.map((m) => m.name).sort() || [];
        const isSameMods =
          currentMods.length === newMods.length &&
          currentMods.every((val, index) => val === newMods[index]);
        return isSameProduct && isSameVariant && isSameMods;
      });

      if (existingIdx > -1) {
        const updatedCart = [...prevCart];
        const item = updatedCart[existingIdx];
        const newQty = item.quantity + 1;
        updatedCart[existingIdx] = {
          ...item,
          quantity: newQty,
          totalPrice: newQty * singleItemPrice,
        };
        return updatedCart;
      } else {
        const newItem: CartItem = {
          product,
          quantity: 1,
          totalPrice: singleItemPrice,
          selectedVariant,
          selectedModifiers,
        };
        return [...prevCart, newItem];
      }
    });
    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (idx: number, amount: number) => {
    setCart(
      (prev) =>
        prev
          .map((item, index) => {
            if (index === idx) {
              const newQty = item.quantity + amount;
              if (newQty <= 0) return null;
              const singlePrice = item.totalPrice / item.quantity;
              return {
                ...item,
                quantity: newQty,
                totalPrice: newQty * singlePrice,
              };
            }
            return item;
          })
          .filter(Boolean) as CartItem[]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Kosongkan Keranjang",
      "Yakin ingin menghapus semua item dari pesanan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          style: "destructive",
          onPress: () => {
            setCart([]);
            setCurrentOpenTab(null);
          },
        },
      ]
    );
  };

  const handleSaveTab = () => {
    if (currentOpenTab) {
      Alert.alert(
        "Info",
        "Pesanan ini sudah tersimpan. Untuk mengubah, selesaikan pembayaran atau buat pesanan baru."
      );
      return;
    }
    setSaveTabModalVisible(true);
  };

  const handleConfirmSaveTab = async (name: string) => {
    setSaveTabModalVisible(false);
    setProcessing(true);
    try {
      await createOpenTab(cart, totalAmount, name);
      Alert.alert(
        "Sukses",
        "Pesanan berhasil disimpan dan stok telah dipotong."
      );
      setCart([]);
      setCurrentOpenTab(null);
    } catch (error: any) {
      Alert.alert("Gagal Menyimpan", error.message);
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  const loadTabIntoCart = (tab: OpenTab) => {
    const restoredCart = tab.items
      .map((item) => {
        const fullProduct = products.find((p) => p.id === item.product.id);
        if (!fullProduct) {
          Alert.alert(
            "Error",
            `Produk "${item.product.name}" tidak lagi tersedia dan telah dihapus dari pesanan ini.`
          );
          return null;
        }
        return { ...item, product: fullProduct };
      })
      .filter(Boolean);

    if (restoredCart.length === 0 && tab.items.length > 0) {
      Alert.alert(
        "Error",
        "Semua produk dalam pesanan ini tidak lagi tersedia."
      );
      setCurrentOpenTab(null);
      setCart([]);
    } else {
      setCart(restoredCart as CartItem[]);
      setCurrentOpenTab(tab);
    }
  };

  const handleSelectOpenTab = (tab: OpenTab) => {
    if (cart.length > 0) {
      Alert.alert(
        "Peringatan",
        "Keranjang saat ini berisi item. Muat pesanan tersimpan akan menghapus item saat ini.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Lanjutkan",
            style: "destructive",
            onPress: () => {
              setCart([]);
              loadTabIntoCart(tab);
            },
          },
        ]
      );
    } else {
      loadTabIntoCart(tab);
    }
  };

  const handleProcessPayment = async (amountPaid: number) => {
    setProcessing(true);
    try {
      if (currentOpenTab) {
        await closeOpenTab(currentOpenTab, amountPaid);
      } else {
        await processTransaction(cart, totalAmount, amountPaid);
      }
      Alert.alert("Sukses", "Transaksi berhasil dan tercatat.");
      setCart([]);
      setCurrentOpenTab(null);
      setPaymentModalVisible(false);
    } catch (error: any) {
      Alert.alert("Transaksi Gagal", error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.processingText}>Memproses...</Text>
        </View>
      )}

      <OptionsModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={handleConfirmAddToCart}
      />

      <PaymentModal
        visible={paymentModalVisible}
        totalAmount={totalAmount}
        onClose={() => setPaymentModalVisible(false)}
        onConfirm={handleProcessPayment}
      />

      <OpenTabsModal
        visible={openTabsModalVisible}
        onClose={() => setOpenTabsModalVisible(false)}
        onSelectTab={handleSelectOpenTab}
      />

      <SaveTabModal
        visible={saveTabModalVisible}
        onClose={() => setSaveTabModalVisible(false)}
        onConfirm={handleConfirmSaveTab}
      />

      <ProductGrid
        products={filteredAndSortedProducts}
        onProductSelect={handleProductSelect}
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
      />

      <Cart
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onPay={() => setPaymentModalVisible(true)}
        onSave={handleSaveTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#f0f2f5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  processingText: {
    marginTop: 12,
    color: "white",
    fontSize: 16,
  },
});

export default CashierScreen;
