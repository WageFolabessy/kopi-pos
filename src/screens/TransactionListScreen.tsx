import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { getTransactions } from "../api/transactions";
import TransactionListItem from "../components/reports/TransactionListItem";
import { Transaction } from "../types";

const TransactionListScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = getTransactions(setTransactions);
    return () => unsubscribe();
  }, []);

  const handleItemPress = useCallback(
    (id: string) => {
      router.push({
        pathname: "/reports/[id]",
        params: { id: id },
      });
    },
    [router]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <TransactionListItem
            item={item}
            onPress={() => item.id && handleItemPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada transaksi.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "gray",
  },
});

export default TransactionListScreen;
