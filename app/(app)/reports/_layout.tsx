import { Stack } from "expo-router";
import React from "react";

export default function ReportsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Riwayat Transaksi",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Detail Transaksi",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
