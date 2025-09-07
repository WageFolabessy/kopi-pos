import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "../src/store/AuthContext";

const InitialLayout = () => {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (user) {
      if (userRole === "Pemilik") {
        router.replace("/dashboard");
      } else if (userRole === "Kasir") {
        router.replace("/cashier");
      } else {
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [user, userRole, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
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
    <>
      <StatusBar hidden={true} />
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
