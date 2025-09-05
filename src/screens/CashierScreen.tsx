import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { auth } from "../api/firebase";

const CashierScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Layar Kasir</Text>
      <Button title="Logout" onPress={() => auth.signOut()} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default CashierScreen;
