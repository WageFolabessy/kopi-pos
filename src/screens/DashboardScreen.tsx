import { Link } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { auth } from "../api/firebase";
import { getTodaysTransactions } from "../api/transactions";
import StatCard from "../components/dashboard/StatCard";
import TopProductsList from "../components/dashboard/TopProductsList";
import { useAuth } from "../store/AuthContext";
import { TopProduct, Transaction } from "../types";

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getTodaysTransactions((data) => {
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { totalRevenue, totalTransactions, topProducts } = useMemo(() => {
    const revenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const count = transactions.length;

    const productCount = transactions
      .flatMap((t) => t.items)
      .reduce((acc, item) => {
        const id = item.product.id!;
        acc[id] = {
          id: id,
          name: item.product.name,
          quantity: (acc[id]?.quantity || 0) + item.quantity,
        };
        return acc;
      }, {} as { [key: string]: TopProduct });

    const sortedTopProducts = Object.values(productCount)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    return {
      totalRevenue: revenue,
      totalTransactions: count,
      topProducts: sortedTopProducts,
    };
  }, [transactions]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcomeTitle}>Selamat Datang!</Text>
      <Text style={styles.welcomeEmail}>{user?.email}</Text>

      <View style={styles.statsRow}>
        <StatCard
          title="Omzet Hari Ini"
          value={`Rp ${totalRevenue.toLocaleString("id-ID")}`}
          icon="money"
          color="#28a745"
        />
        <StatCard
          title="Transaksi Hari Ini"
          value={totalTransactions.toString()}
          icon="bar-chart"
          color="#007bff"
        />
      </View>

      <TopProductsList products={topProducts} />

      <View style={styles.devButton}>
        <Link href="/developer" asChild>
          <Button title="Menu Developer (Seed DB)" color="orange" />
        </Link>
      </View>

      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={() => auth.signOut()} color="red" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  welcomeEmail: {
    fontSize: 16,
    color: "gray",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  devButton: {
    marginTop: 32,
    marginHorizontal: 16,
  },
  logoutButton: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 40,
  },
});

export default DashboardScreen;
