import { FontAwesome } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function ProductsLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Produk",
          headerTitleAlign: "center",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/products/form")}
              style={{ marginRight: 15 }}
            >
              <FontAwesome name="plus-circle" size={28} color="#1e90ff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="form"
        options={{
          presentation: "modal",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
