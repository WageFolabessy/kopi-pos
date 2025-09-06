import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addIngredient,
  deleteIngredient,
  getIngredients,
  updateIngredient,
} from "../api/inventory";
import { Ingredient } from "../types";

const InventoryScreen: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [unit, setUnit] = useState<"gram" | "ml" | "pcs">("gram");
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );

  useEffect(() => {
    const unsubscribe = getIngredients(setIngredients);
    return () => unsubscribe();
  }, []);

  const sortedIngredients = useMemo(() => {
    return [...ingredients].sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients]);

  const openModalToAdd = () => {
    setEditingIngredient(null);
    setName("");
    setStock("");
    setMinStock("");
    setUnit("gram");
    setModalVisible(true);
  };

  const openModalToEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setName(ingredient.name);
    setStock(ingredient.stock.toString());
    setMinStock(ingredient.minStock.toString());
    setUnit(ingredient.unit);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const stockNum = parseFloat(stock);
    const minStockNum = parseFloat(minStock);

    if (!name || isNaN(stockNum) || isNaN(minStockNum)) {
      Alert.alert("Error", "Semua kolom harus diisi dengan benar.");
      return;
    }

    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id!, {
          name,
          stock: stockNum,
          minStock: minStockNum,
          unit,
        });
      } else {
        await addIngredient({
          name,
          stock: stockNum,
          minStock: minStockNum,
          unit,
        });
      }
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      "Hapus Bahan Baku",
      "Apakah Anda yakin ingin menghapus item ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteIngredient(id);
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Ingredient }) => (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text
            style={[
              styles.cardInfo,
              styles.stockSufficient,
              item.stock < item.minStock && styles.lowStock,
            ]}
          >
            Stok: {item.stock.toLocaleString("id-ID")} {item.unit}
          </Text>
          <Text style={[styles.cardInfo, styles.minStockInfo]}>
            Stok Min: {item.minStock.toLocaleString("id-ID")} {item.unit}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openModalToEdit(item)}
          >
            <FontAwesome name="pencil" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => item.id && handleDelete(item.id)}
          >
            <FontAwesome name="trash" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleDelete]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedIngredients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada bahan baku.</Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingIngredient ? "Ubah Bahan Baku" : "Tambah Bahan Baku"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nama Bahan Baku"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Jumlah Stok"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Stok Minimum"
              value={minStock}
              onChangeText={setMinStock}
              keyboardType="numeric"
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={unit}
                onValueChange={(itemValue) => setUnit(itemValue)}
              >
                <Picker.Item label="gram" value="gram" />
                <Picker.Item label="ml" value="ml" />
                <Picker.Item label="pcs" value="pcs" />
              </Picker>
            </View>
            <Button
              title={editingIngredient ? "Simpan Perubahan" : "Tambah"}
              onPress={handleSave}
            />
            <View style={{ marginTop: 8 }}>
              <Button
                title="Batal"
                color="gray"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={openModalToAdd}>
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 30,
    bottom: 30,
    backgroundColor: "#007bff",
    borderRadius: 30,
    elevation: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "gray",
  },
  card: {
    backgroundColor: "white",
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: "center",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardInfo: { fontSize: 14, color: "#555", marginTop: 4 },
  lowStock: { color: "#dc3545", fontWeight: "bold" },
  stockSufficient: { color: "#28a745", fontWeight: "bold" },
  minStockInfo: { color: "#c82333" },
  cardActions: { flexDirection: "row", gap: 10 },
  editButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
  },
  pickerContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
});

export default InventoryScreen;
