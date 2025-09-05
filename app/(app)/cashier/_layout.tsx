import { Stack } from "expo-router";
import React from "react";

export default function CashierLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Kasir",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
