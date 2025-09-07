import { useCashier } from "@/src/store/CashierContext";
import { FontAwesome } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function CashierLayout() {
  const { setOpenTabsModalVisible } = useCashier();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Kasir",
          headerTitleAlign: "center",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setOpenTabsModalVisible(true)}
              style={{ marginRight: 15 }}
            >
              <FontAwesome name="folder-open-o" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
