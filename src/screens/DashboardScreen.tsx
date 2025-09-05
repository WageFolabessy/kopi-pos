import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { auth } from "../api/firebase";

const DashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat Datang!</Text>
      <Text style={styles.subtitle}>Aplikasi POS Warung Kopi</Text>
      <View style={styles.spacer} />
      <Button title="Logout" onPress={() => auth.signOut()} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
  },
  spacer: {
    height: 40,
  },
});

export default DashboardScreen;
