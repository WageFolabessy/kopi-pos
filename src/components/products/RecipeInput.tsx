import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Ingredient } from "../../types";

interface RecipeInputProps {
  ingredients: Ingredient[];
  onAdd: (ingredientId: string, quantity: number) => void;
}

const RecipeInput: React.FC<RecipeInputProps> = ({ ingredients, onAdd }) => {
  const [selectedIngredient, setSelectedIngredient] = useState<
    string | undefined
  >(ingredients[0]?.id);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (!selectedIngredient && ingredients.length > 0) {
      setSelectedIngredient(ingredients[0].id);
    }
  }, [ingredients]);

  const handleAdd = () => {
    const quantityNum = parseFloat(quantity);
    if (selectedIngredient && !isNaN(quantityNum) && quantityNum > 0) {
      onAdd(selectedIngredient, quantityNum);
      setQuantity("");
    } else {
      Alert.alert("Error", "Pilih bahan dan masukkan jumlah yang valid.");
    }
  };

  return (
    <View style={styles.recipeInputContainer}>
      <View style={styles.recipePickerWrapper}>
        <Picker
          selectedValue={selectedIngredient}
          onValueChange={(itemValue) => setSelectedIngredient(itemValue)}
        >
          {ingredients.map((ing) => (
            <Picker.Item key={ing.id} label={ing.name} value={ing.id} />
          ))}
        </Picker>
      </View>
      <TextInput
        style={styles.recipeQuantityInput}
        placeholder="Jumlah"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.optionAddButton} onPress={handleAdd}>
        <FontAwesome name="plus" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  recipeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  recipePickerWrapper: {
    flex: 1,
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  recipeQuantityInput: {
    width: 80,
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

export default RecipeInput;
