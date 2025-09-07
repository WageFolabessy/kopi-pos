import { useAuth } from "@/src/store/AuthContext";
import { CashierProvider } from "@/src/store/CashierContext";
import { FontAwesome } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) => {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
};

export default function AppLayout() {
  const { userRole, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <CashierProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#1e90ff",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: userRole === "Kasir" ? { display: "none" } : undefined,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
            href: (userRole === "Pemilik" ? "/dashboard" : null) as any,
          }}
        />
        <Tabs.Screen
          name="cashier"
          options={{
            title: "Kasir",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="money" color={color} />
            ),
            href: "/cashier",
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: "Produk",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="inbox" color={color} />
            ),
            href: (userRole === "Pemilik" ? "/products" : null) as any,
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{
            title: "Inventori",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="archive" color={color} />
            ),
            href: (userRole === "Pemilik" ? "/inventory" : null) as any,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "Laporan",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="history" color={color} />
            ),
            href: (userRole === "Pemilik" ? "/reports" : null) as any,
          }}
        />
        <Tabs.Screen
          name="developer"
          options={{
            title: "Developer",
            href: null,
          }}
        />
      </Tabs>
    </CashierProvider>
  );
}
