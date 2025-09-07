import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getOpenTabs } from "../../api/openTabs";
import { OpenTab } from "../../types";

interface OpenTabsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTab: (tab: OpenTab) => void;
}

const OpenTabsModal: React.FC<OpenTabsModalProps> = ({
  visible,
  onClose,
  onSelectTab,
}) => {
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      const unsubscribe = getOpenTabs((data) => {
        setTabs(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [visible]);

  const handleSelect = (tab: OpenTab) => {
    onSelectTab(tab);
    onClose();
  };

  const renderItem = ({ item }: { item: OpenTab }) => (
    <TouchableOpacity style={styles.tabItem} onPress={() => handleSelect(item)}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabName}>{item.customerName}</Text>
        <Text style={styles.tabTotal}>
          Rp {item.totalAmount.toLocaleString("id-ID")}
        </Text>
      </View>
      <View style={styles.itemDetailsContainer}>
        {item.items.map((cartItem, index) => (
          <Text key={index} style={styles.itemDetailText} numberOfLines={1}>
            - {cartItem.quantity}x {cartItem.product.name}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Pesanan Aktif</Text>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={tabs}
              renderItem={renderItem}
              keyExtractor={(item) => item.id!}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Tidak ada pesanan aktif.</Text>
              }
            />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "60%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  tabItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  tabHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  tabTotal: { fontSize: 16, color: "green", fontWeight: "500" },
  itemDetailsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  itemDetailText: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
    marginTop: 40,
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    alignItems: "center",
    padding: 10,
  },
  closeButtonText: {
    color: "#007bff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OpenTabsModal;
