import React, { useMemo, useState } from "react";
import {
    Alert,
    Button,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

interface PaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onClose: () => void;
  onConfirm: (amountPaid: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  totalAmount,
  onClose,
  onConfirm,
}) => {
  const [amountPaid, setAmountPaid] = useState("");

  const change = useMemo(() => {
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < totalAmount) {
      return null;
    }
    return paid - totalAmount;
  }, [amountPaid, totalAmount]);

  const handleConfirm = () => {
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < totalAmount) {
      Alert.alert("Error", "Jumlah pembayaran tidak mencukupi.");
      return;
    }
    onConfirm(paid);
    setAmountPaid("");
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
          <Text style={styles.modalTitle}>Pembayaran Tunai</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Tagihan</Text>
            <Text style={styles.totalAmount}>
              Rp {totalAmount.toLocaleString("id-ID")}
            </Text>
          </View>
          <Text style={styles.inputLabel}>Uang Diterima</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan jumlah uang"
            value={amountPaid}
            onChangeText={setAmountPaid}
            keyboardType="numeric"
            autoFocus
          />
          {change !== null && (
            <View style={styles.row}>
              <Text style={styles.label}>Kembalian</Text>
              <Text style={styles.changeAmount}>
                Rp {change.toLocaleString("id-ID")}
              </Text>
            </View>
          )}
          <View style={{ marginTop: 20 }}>
            <Button
              title="Konfirmasi Pembayaran"
              onPress={handleConfirm}
              disabled={change === null}
            />
            <View style={{ marginTop: 8 }}>
              <Button title="Batal" color="gray" onPress={onClose} />
            </View>
          </View>
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  label: { fontSize: 16, color: "gray" },
  totalAmount: { fontSize: 18, fontWeight: "bold" },
  changeAmount: { fontSize: 18, fontWeight: "bold", color: "green" },
  inputLabel: { fontSize: 16, color: "#333", marginBottom: 8, marginTop: 10 },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: "right",
  },
});

export default PaymentModal;
