import React, { useMemo, useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface SaveTabModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const SaveTabModal: React.FC<SaveTabModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState("");

  const isValid = useMemo(() => (name || "").trim().length > 0, [name]);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      setName("");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalBackdrop}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Simpan Pesanan</Text>
          <Text style={styles.modalSubtitle}>
            Masukkan nama pelanggan atau nomor meja:
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Contoh: Meja 5"
            autoFocus
          />
          <View style={{ marginTop: 20 }}>
            <Pressable
              onPress={handleConfirm}
              disabled={!isValid}
              style={[
                styles.saveButton,
                isValid ? styles.saveEnabled : styles.saveDisabled,
              ]}
            >
              <Text style={styles.saveText}>Simpan Pesanan</Text>
            </Pressable>
            <View style={{ marginTop: 8 }}>
              <Button title="Batal" color="gray" onPress={onClose} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 12,
  },
  saveEnabled: { backgroundColor: "#1565c0" },
  saveDisabled: { backgroundColor: "#c7c7c7" },
  saveText: { color: "#fff", fontWeight: "600" },
});

export default SaveTabModal;
