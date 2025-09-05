import { Stack, useRouter } from "expo-router";
import React from "react";

export default function ProductsLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Produk",
          headerTitleAlign: "center"
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
