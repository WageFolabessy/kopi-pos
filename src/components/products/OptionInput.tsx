import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    Keyboard,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface OptionInputProps {
  title: string;
  onAdd: (name: string, price: number) => void;
}

const OptionInput: React.FC<OptionInputProps> = ({ title, onAdd }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleAdd = () => {
    const priceNumber = parseFloat(price || "0");
    if (!name.trim()) {
      Alert.alert("Error", "Nama tidak boleh kosong.");
      return;
    }
    onAdd(name, priceNumber);
    setName("");
    setPrice("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.optionInputContainer}>
      <TextInput
        style={styles.optionInputName}
        placeholder={`Nama ${title}`}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.optionInputPrice}
        placeholder="+/- Harga"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.optionAddButton} onPress={handleAdd}>
        <FontAwesome name="plus" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  optionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  optionInputName: {
    flex: 1,
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  optionInputPrice: {
    width: 100,
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  optionAddButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 45,
  },
});

export default OptionInput;
