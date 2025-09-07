import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Transaction } from "../../types";

interface TransactionListItemProps {
  item: Transaction;
  onPress: () => void;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  item,
  onPress,
}) => {
  const transactionDate = item.createdAt.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const transactionTime = item.createdAt.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <Text style={styles.dateText}>{transactionDate}</Text>
        <Text style={styles.timeText}>{transactionTime} WIB</Text>
        <Text style={styles.totalAmount}>
          Rp {item.totalAmount.toLocaleString("id-ID")}
        </Text>
      </View>
      <FontAwesome name="chevron-right" size={16} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  timeText: {
    fontSize: 14,
    color: "gray",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
  },
});

export default React.memo(TransactionListItem);
