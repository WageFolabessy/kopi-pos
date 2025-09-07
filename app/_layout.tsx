import "react-native-gesture-handler";

import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../src/store/AuthContext";
import { CashierProvider } from "../src/store/CashierContext";

const InitialLayout = () => {
  const { user, userRole, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAppGroup = segments[0] === "(app)";

    if (user && !inAppGroup) {
      if (userRole === "Pemilik") {
        router.replace("/dashboard");
      } else if (userRole === "Kasir") {
        router.replace("/cashier");
      }
    } else if (!user && inAppGroup) {
      router.replace("/login");
    }
  }, [user, userRole, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <CashierProvider>
          <InitialLayout />
        </CashierProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
