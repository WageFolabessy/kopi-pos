import { Stack } from "expo-router";
import React from "react";

export default function InventoryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Inventori",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
