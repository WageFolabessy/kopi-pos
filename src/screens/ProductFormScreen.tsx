import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../api/firebase';
import { addProduct, updateProduct, uploadImage } from '../api/products';
import { Modifier, Product, Variant } from '../types';

// --- Helper Component for Variant/Modifier Input ---
interface OptionInputProps {
  title: string;
  onAdd: (name: string, price: number) => void;
}

const OptionInput: React.FC<OptionInputProps> = ({ title, onAdd }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = () => {
    const priceNumber = parseFloat(price || '0');
    if (!name.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong.');
      return;
    }
    onAdd(name, priceNumber);
    setName('');
    setPrice('');
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

// --- Main ProductFormScreen Component ---
const ProductFormScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ productId?: string }>();
  const isEditing = !!params.productId;

  // Product States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Kopi' | 'Non-Kopi' | 'Makanan'>('Kopi');
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // Variant & Modifier States
  const [variants, setVariants] = useState<Variant[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- Functions ---
  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('Kopi');
    setImageUri(null);
    setVariants([]);
    setModifiers([]);
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setInitialLoading(true);
      if (params.productId) {
        const docRef = doc(db, 'products', params.productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = docSnap.data() as Product;
          setName(productData.name);
          setPrice(productData.price.toString());
          setCategory(productData.category);
          setImageUri(productData.imageUrl || null);
          setVariants(productData.variants || []);
          setModifiers(productData.modifiers || []);
        }
      } else {
        resetForm();
      }
      setInitialLoading(false);
    };
    fetchProductData();
  }, [params.productId]);
  
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleFormSubmit = async () => {
    const productPrice = parseFloat(price);
    if (!name || isNaN(productPrice) || productPrice <= 0) {
      Alert.alert('Error', 'Nama dan Harga produk tidak valid.');
      return;
    }
    
    if (!isEditing && !imageUri) {
      Alert.alert('Error', 'Silakan pilih foto untuk produk baru.');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = imageUri || '';
      if (imageUri && imageUri.startsWith('file://')) {
        uploadedImageUrl = await uploadImage(imageUri);
      }
      
      const productData = {
        name,
        price: productPrice,
        category,
        imageUrl: uploadedImageUrl,
        variants,
        modifiers,
      };

      if (isEditing && params.productId) {
        await updateProduct(params.productId, productData);
        Alert.alert('Sukses', 'Produk berhasil diperbarui.');
      } else {
        await addProduct(productData);
        Alert.alert('Sukses', 'Produk baru berhasil ditambahkan.');
      }
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan produk.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  if (initialLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? 'Ubah Produk' : 'Tambah Produk' }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.formContainer}>
            <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                    <FontAwesome name="camera" size={32} color="#aaa" />
                    <Text style={styles.imagePlaceholderText}>Pilih Foto</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Nama Produk</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            
            <Text style={styles.label}>Harga Dasar</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
            
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)}>
                <Picker.Item label="Kopi" value="Kopi" />
                <Picker.Item label="Non-Kopi" value="Non-Kopi" />
                <Picker.Item label="Makanan" value="Makanan" />
              </Picker>
            </View>
        </View>

        {/* --- Variants Section --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Varian (Contoh: Panas, Dingin)</Text>
          {variants.map((variant, index) => (
            <View key={index} style={styles.optionItem}>
              <Text>{variant.name} (Rp {variant.priceAdjustment.toLocaleString('id-ID')})</Text>
              <TouchableOpacity onPress={() => setVariants(variants.filter((_, i) => i !== index))}>
                <FontAwesome name="trash" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          <OptionInput title="Varian" onAdd={(name, price) => setVariants([...variants, { name, priceAdjustment: price }])} />
        </View>

        {/* --- Modifiers Section --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Modifier (Contoh: Extra Shot)</Text>
          {modifiers.map((modifier, index) => (
            <View key={index} style={styles.optionItem}>
              <Text>{modifier.name} (+Rp {modifier.priceAdjustment.toLocaleString('id-ID')})</Text>
              <TouchableOpacity onPress={() => setModifiers(modifiers.filter((_, i) => i !== index))}>
                <FontAwesome name="trash" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          <OptionInput title="Modifier" onAdd={(name, price) => setModifiers([...modifiers, { name, priceAdjustment: price }])} />
        </View>

        {/* --- Submit Button --- */}
        <View style={styles.submitSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
                <Text style={styles.submitButtonText}>{isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0f2f5',
  },
  formContainer: { 
    padding: 20,
    backgroundColor: 'white', 
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
  },
  sectionContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    marginTop: 16,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 16 
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: { 
    height: 50, 
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 8, 
    marginBottom: 16, 
    paddingHorizontal: 16, 
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickerContainer: { 
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 8, 
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 120 : 60,
    overflow: 'hidden'
  },
  imagePicker: { 
    height: 140, 
    width: 140, 
    borderRadius: 12, 
    backgroundColor: '#f8f8f8', 
    justifyContent: 'center', 
    alignItems: 'center', 
    alignSelf: 'center', 
    marginBottom: 24, 
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed'
  },
  imagePreview: { 
    width: '100%', 
    height: '100%' 
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#aaa'
  },
  submitSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginTop: 8 
  },
  optionInputName: { 
    flex: 1, 
    height: 45, 
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    backgroundColor: '#fafafa' 
  },
  optionInputPrice: { 
    width: 100, 
    height: 45, 
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    backgroundColor: '#fafafa' 
  },
  optionAddButton: { 
    backgroundColor: '#28a745', 
    padding: 12, 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
  },
  optionItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
});

export default ProductFormScreen;

