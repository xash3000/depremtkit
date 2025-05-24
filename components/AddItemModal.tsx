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
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const quantityNum = parseInt(quantity) || 1;
    if (quantityNum <= 0) {
      Alert.alert('Error', 'Quantity must be greater than 0');
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

  const renderCategorySelector = () => (
    <View style={styles.section}>
      <ThemedText style={styles.label}>Category</ThemedText>
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
    </View>
  );

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
            <ThemedText style={styles.headerButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>
            {editingItem ? 'Edit Item' : 'Add Item'}
          </ThemedText>
          
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <ThemedText style={[styles.headerButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
              Save
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Name Input */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Item Name *</ThemedText>
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
              placeholder="e.g., Water bottles, First aid kit"
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
              autoFocus
            />
          </View>

          {/* Category Selector */}
          {renderCategorySelector()}

          {/* Quantity Input */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Quantity</ThemedText>
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
            <ThemedText style={styles.label}>Unit</ThemedText>
            <View style={styles.unitContainer}>
              {['pcs', 'kg', 'L', 'pack', 'box', 'bottle'].map((unitOption) => (
                <TouchableOpacity
                  key={unitOption}
                  style={[
                    styles.unitOption,
                    {
                      backgroundColor: unit === unitOption ? '#007AFF' : (isDark ? '#2C2C2E' : '#FFF'),
                      borderColor: unit === unitOption ? '#007AFF' : (isDark ? '#3C3C3E' : '#E1E1E1'),
                    }
                  ]}
                  onPress={() => setUnit(unitOption)}
                >
                  <ThemedText style={[
                    styles.unitText,
                    { color: unit === unitOption ? '#FFF' : (isDark ? '#FFF' : '#000') }
                  ]}>
                    {unitOption}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Expiration Date */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Expiration Date (Optional)</ThemedText>
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
              onChangeText={setExpirationDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
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
              placeholder="Additional notes about this item..."
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
              <ThemedText style={styles.checkboxLabel}>Mark as checked</ThemedText>
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
});
