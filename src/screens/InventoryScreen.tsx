import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );

  // Form states
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState<"gram" | "ml" | "pcs">("gram");
  const [minStock, setMinStock] = useState("");

  useEffect(() => {
    const unsubscribe = getIngredients((data) => {
      setIngredients(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openModal = (ingredient: Ingredient | null = null) => {
    setEditingIngredient(ingredient);
    if (ingredient) {
      setName(ingredient.name);
      setStock(ingredient.stock.toString());
      setUnit(ingredient.unit);
      setMinStock(ingredient.minStock.toString());
    } else {
      setName("");
      setStock("");
      setUnit("gram");
      setMinStock("");
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    const stockNum = parseFloat(stock);
    const minStockNum = parseFloat(minStock);

    if (!name || isNaN(stockNum) || isNaN(minStockNum)) {
      Alert.alert("Error", "Semua field harus diisi dengan benar.");
      return;
    }

    const ingredientData = {
      name,
      stock: stockNum,
      unit,
      minStock: minStockNum,
    };

    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id!, ingredientData);
      } else {
        await addIngredient(ingredientData);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan data.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Hapus Bahan",
      "Apakah Anda yakin ingin menghapus bahan baku ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteIngredient(id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Ingredient }) => {
    const isLowStock = item.stock <= item.minStock;
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={isLowStock ? styles.stockLow : styles.stockNormal}>
            Stok: {item.stock.toLocaleString("id-ID")} {item.unit}
          </Text>
          <Text style={styles.minStockText}>
            Stok Min: {item.minStock.toLocaleString("id-ID")} {item.unit}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openModal(item)}
          >
            <FontAwesome name="pencil" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id!)}
          >
            <FontAwesome name="trash" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ingredients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada bahan baku.</Text>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingIngredient ? "Ubah Bahan Baku" : "Tambah Bahan Baku"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nama Bahan"
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
                <Picker.Item label="Gram (g)" value="gram" />
                <Picker.Item label="Mililiter (ml)" value="ml" />
                <Picker.Item label="Pcs (pcs)" value="pcs" />
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <Button
                title="Batal"
                onPress={() => setModalVisible(false)}
                color="gray"
              />
              <Button title="Simpan" onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  cardContent: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  stockNormal: { fontSize: 16, color: "green", marginVertical: 4 },
  stockLow: {
    fontSize: 16,
    color: "red",
    marginVertical: 4,
    fontWeight: "bold",
  },
  minStockText: { fontSize: 14, color: "gray" },
  cardActions: { flexDirection: "column", gap: 10 },
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
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
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-around" },
});

export default InventoryScreen;
