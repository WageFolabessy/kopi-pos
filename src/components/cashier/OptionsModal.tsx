import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Modifier, Product, Variant } from "../../types";

interface OptionsModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    product: Product,
    selectedVariant?: Variant,
    selectedModifiers?: Modifier[]
  ) => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({
  product,
  visible,
  onClose,
  onConfirm,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    undefined
  );
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[0]);
      setSelectedModifiers([]);
    }
  }, [product]);

  if (!product) return null;

  const handleModifierToggle = (modifier: Modifier) => {
    setSelectedModifiers((prev) =>
      prev.find((m) => m.name === modifier.name)
        ? prev.filter((m) => m.name !== modifier.name)
        : [...prev, modifier]
    );
  };

  const handleConfirm = () => {
    onConfirm(product, selectedVariant, selectedModifiers);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{product.name}</Text>

          {product.variants && product.variants.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Pilih Varian (wajib)</Text>
              {product.variants.map((variant) => (
                <TouchableOpacity
                  key={variant.name}
                  style={[
                    styles.optionButton,
                    selectedVariant?.name === variant.name &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedVariant(variant)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedVariant?.name === variant.name &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {variant.name} (Rp{" "}
                    {variant.priceAdjustment.toLocaleString("id-ID")})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {product.modifiers && product.modifiers.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Pilih Modifier (opsional)</Text>
              {product.modifiers.map((modifier) => (
                <TouchableOpacity
                  key={modifier.name}
                  style={[
                    styles.optionButton,
                    selectedModifiers.find((m) => m.name === modifier.name) &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => handleModifierToggle(modifier)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedModifiers.find((m) => m.name === modifier.name) &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {modifier.name} (+Rp{" "}
                    {modifier.priceAdjustment.toLocaleString("id-ID")})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Konfirmasi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Batal</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
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
  optionSection: { marginBottom: 20 },
  optionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  optionButtonSelected: { backgroundColor: "#007bff", borderColor: "#007bff" },
  optionText: { fontSize: 14 },
  optionTextSelected: { color: "white" },
  confirmButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  confirmButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  closeButton: { marginTop: 12, alignItems: "center" },
  closeButtonText: { color: "gray" },
});

export default OptionsModal;
