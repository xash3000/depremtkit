import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { dateUtils } from '@/services/utils';
import { Item, ITEM_CATEGORIES, ItemCategory } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingItem?: Item | null;
}

export function AddItemModal({ visible, onClose, onSave, editingItem }: AddItemModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>(ITEM_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setSelectedCategory(ITEM_CATEGORIES.find(cat => cat.id === editingItem.category) || ITEM_CATEGORIES[0]);
      setQuantity(editingItem.quantity.toString());
      setUnit(editingItem.unit || 'pcs');
      setExpirationDate(editingItem.expirationDate ? dateUtils.formatDateForInput(editingItem.expirationDate) : '');
      setNotes(editingItem.notes || '');
      setIsChecked(editingItem.isChecked);
    } else {
      // Reset form for new item
      setName('');
      setSelectedCategory(ITEM_CATEGORIES[0]);
      setQuantity('1');
      setUnit('pcs');
      setExpirationDate('');
      setNotes('');
      setIsChecked(false);
    }
  }, [editingItem, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Lütfen bir eşya adı girin');
      return;
    }

    const quantityNum = parseInt(quantity) || 1;
    if (quantityNum <= 0) {
      Alert.alert('Hata', 'Miktar 0\'dan büyük olmalıdır');
      return;
    }

    const itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      category: selectedCategory.id,
      quantity: quantityNum,
      unit,
      expirationDate: expirationDate || undefined,
      notes: notes.trim() || undefined,
      isChecked,
    };

    onSave(itemData);
  };

  const getRecommendations = (category: ItemCategory) => {
    const recommendations: { [key: string]: string[] } = {
      water: ['Su şişesi (en az 2L kişi başı)', 'Taşınabilir su filtresi'],
      food: ['Konserve gıdalar', 'Enerji barları', 'Kuru meyve ve kuruyemiş'],
      medical: ['İlk yardım çantası', 'Reçeteli ilaçlar', 'Ağrı kesiciler', 'Bandaj'],
      tools: ['Düdük','El feneri ve yedek piller', 'Çok amaçlı alet'],
      clothing: ['Yağmurluk', 'Sıcak battaniye'],
      documents: ['Kimlik fotokopisi', 'Nakit para', 'Acil durum iletişim numaraları'],
      communication: ['Cep telefonu şarji', 'Pilli radyo'],
      hygiene: ['Islak mendil', 'Tuvalet kağıdı', 'El dezenfektanı'],
      other: ['Power bank', 'Toz maskesi']
    };
    
    return recommendations[category.id] || [];
  };

  const recommendations = getRecommendations(selectedCategory);

  const handleRecommendationPress = (recommendation: string) => {
    setName(recommendation);
  };

  const renderCategorySelector = () => (
    <View style={styles.section}>
      <ThemedText style={styles.label}>Kategori</ThemedText>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {ITEM_CATEGORIES.map((category) => {
          const isSelected = selectedCategory.id === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: isSelected ? category.color : (isDark ? '#2C2C2E' : '#F5F5F5'),
                  borderColor: category.color,
                  borderWidth: isSelected ? 2 : 1,
                }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <MaterialIcons
                name={category.icon as any}
                size={20}
                color={isSelected ? 'white' : category.color}
              />
              <Text style={[
                styles.categoryItemText,
                { color: isSelected ? 'white' : (isDark ? '#FFF' : '#333') }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <ThemedText style={styles.recommendationsTitle}>Önerilen Eşyalar:</ThemedText>
          <View style={styles.recommendationsList}>
            {recommendations.map((rec, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.recommendationItem,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#F8F9FA',
                    borderColor: selectedCategory.color,
                  }
                ]}
                onPress={() => handleRecommendationPress(rec)}
              >
                <ThemedText style={[
                  styles.recommendationText,
                  { color: selectedCategory.color }
                ]}>
                  {rec}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpirationDate(dateUtils.formatDateForInput(selectedDate.toISOString()));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#000' : '#F2F2F7' }
      ]}>
        {/* Header */}
        <View style={[
          styles.header,
          { 
            backgroundColor: isDark ? '#1C1C1E' : '#FFF',
            borderBottomColor: isDark ? '#2C2C2E' : '#E1E1E1',
          }
        ]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <ThemedText style={styles.headerButtonText}>İptal</ThemedText>
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>
            {editingItem ? 'Eşyayı Düzenle' : 'Eşya Ekle'}
          </ThemedText>
          
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <ThemedText style={[styles.headerButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
              Kaydet
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Name Input */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Eşya Adı *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#FFF',
                  borderColor: isDark ? '#3C3C3E' : '#E1E1E1',
                  color: isDark ? '#FFF' : '#000',
                }
              ]}
              value={name}
              onChangeText={setName}
              placeholder="örn. Su, yara bandı"
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
              autoFocus
            />
          </View>

          {/* Category Selector */}
          {renderCategorySelector()}

          {/* Quantity Input */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Miktar</ThemedText>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#FFF',
                    borderColor: isDark ? '#3C3C3E' : '#E1E1E1',
                  }
                ]}
                onPress={() => {
                  const num = Math.max(1, parseInt(quantity) - 1);
                  setQuantity(num.toString());
                }}
              >
                <MaterialIcons name="remove" size={20} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
              
              <TextInput
                style={[
                  styles.quantityInput,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#FFF',
                    borderColor: isDark ? '#3C3C3E' : '#E1E1E1',
                    color: isDark ? '#FFF' : '#000',
                  }
                ]}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                textAlign="center"
              />
              
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#FFF',
                    borderColor: isDark ? '#3C3C3E' : '#E1E1E1',
                  }
                ]}
                onPress={() => {
                  const num = parseInt(quantity) + 1;
                  setQuantity(num.toString());
                }}
              >
                <MaterialIcons name="add" size={20} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Unit */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Birim</ThemedText>
            <View style={styles.unitContainer}>
            {['adet', 'gr', 'L', 'paket', 'kutu', 'şişe'].map((unitOption, index) => {
              const originalUnits = ['pcs', 'g', 'L', 'pack', 'box', 'bottle'];
              const originalUnit = originalUnits[index];
              return (
                <TouchableOpacity
                  key={originalUnit}
                  style={[
                    styles.unitOption,
                    {
                      backgroundColor: unit === originalUnit ? '#007AFF' : (isDark ? '#2C2C2E' : '#FFF'),
                      borderColor: unit === originalUnit ? '#007AFF' : (isDark ? '#3C3C3E' : '#E1E1E1'),
                    }
                  ]}
                  onPress={() => setUnit(originalUnit)}
                >
                  <ThemedText style={[
                    styles.unitText,
                    { color: unit === originalUnit ? '#FFF' : (isDark ? '#FFF' : '#000') }
                  ]}>
                    {unitOption}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
            </View>
          </View>

          {/* Expiration Date */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Son Kullanma Tarihi (İsteğe Bağlı)</ThemedText>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View pointerEvents="none">
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#2C2C2E' : '#FFF',
                      borderColor: isDark ? '#3C3C3E' : '#E1E1E1',
                      color: isDark ? '#FFF' : '#000',
                    }
                  ]}
                  value={expirationDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                  editable={false}
                />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                }}
              >
                <DateTimePicker
                  value={expirationDate ? new Date(expirationDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date(2100, 11, 31)}
                  themeVariant={isDark ? "dark" : "light"}
                />
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Notlar (İsteğe Bağlı)</ThemedText>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#FFF',
                  borderColor: isDark ? '#3C3C3E' : '#E1E1E1',
                  color: isDark ? '#FFF' : '#000',
                }
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Bu eşya hakkında ek notlar..."
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Checked Status */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsChecked(!isChecked)}
            >
              <View style={[
                styles.checkbox,
                {
                  backgroundColor: isChecked ? Colors[colorScheme ?? 'light'].tint : 'transparent',
                  borderColor: isChecked ? Colors[colorScheme ?? 'light'].tint : (isDark ? '#666' : '#CCC'),
                }
              ]}>
                {isChecked && (
                  <MaterialIcons name="check" size={16} color="white" />
                )}
              </View>
              <ThemedText style={styles.checkboxLabel}>Kontrol edildi olarak işaretle</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItemText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginHorizontal: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  recommendationsContainer: {
    marginTop: 16,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  recommendationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recommendationItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
