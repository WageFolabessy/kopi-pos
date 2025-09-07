import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getTransactionById } from "../api/transactions";
import { Transaction } from "../types";

const TransactionDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTransaction = async () => {
        setLoading(true);
        const data = await getTransactionById(id);
        setTransaction(data);
        setLoading(false);
      };
      fetchTransaction();
    }
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text>Transaksi tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>Detail Transaksi</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal</Text>
          <Text style={styles.value}>
            {transaction.createdAt.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Waktu</Text>
          <Text style={styles.value}>
            {transaction.createdAt.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            WIB
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Metode Bayar</Text>
          <Text style={styles.value}>{transaction.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.headerTitle}>Ringkasan Pesanan</Text>
        {transaction.items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemQuantity}>{item.quantity}x</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              {item.selectedVariant && (
                <Text style={styles.itemOption}>
                  - {item.selectedVariant.name}
                </Text>
              )}
              {item.selectedModifiers?.map((m) => (
                <Text key={m.name} style={styles.itemOption}>
                  - {m.name}
                </Text>
              ))}
            </View>
            <Text style={styles.itemTotal}>
              Rp {item.totalPrice.toLocaleString("id-ID")}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.headerTitle}>Ringkasan Pembayaran</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>
            Rp {transaction.totalAmount.toLocaleString("id-ID")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Bayar</Text>
          <Text style={[styles.value, styles.finalTotal]}>
            Rp {transaction.totalAmount.toLocaleString("id-ID")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Uang Diterima</Text>
          <Text style={styles.value}>
            Rp {(transaction.amountPaid ?? 0).toLocaleString("id-ID")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Kembalian</Text>
          <Text style={styles.value}>
            Rp {(transaction.change ?? 0).toLocaleString("id-ID")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: { fontSize: 16, color: "gray" },
  value: { fontSize: 16, color: "#333" },
  finalTotal: { fontWeight: "bold" },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  itemQuantity: { fontSize: 16, marginRight: 10, color: "#555" },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "500" },
  itemOption: { fontSize: 12, color: "gray", marginLeft: 4 },
  itemTotal: { fontSize: 16 },
});

export default TransactionDetailScreen;
