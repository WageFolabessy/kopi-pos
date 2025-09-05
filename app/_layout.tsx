import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { AuthProvider, useAuth } from "../src/store/AuthContext";

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
    <>
      <StatusBar hidden={true} />
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </>
  );
}
