import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddItemModal } from '@/components/AddItemModal';
import { ItemCard } from '@/components/ItemCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { databaseService } from '@/services/database';
import { Item, ITEM_CATEGORIES, ItemCategory } from '@/types';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>(ITEM_CATEGORIES[0]);
  const [items, setItems] = useState<Item[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const loadItemsForCategory = async (category: ItemCategory) => {
    try {
      const categoryItems = await databaseService.getItemsByCategory(category.id);
      setItems(categoryItems);
    } catch (error) {
      console.error('Error loading category items:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItemsForCategory(selectedCategory);
    }, [selectedCategory])
  );

  const handleCategoryChange = (category: ItemCategory) => {
    setSelectedCategory(category);
    loadItemsForCategory(category);
  };

  const handleAddItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await databaseService.addItem({ ...itemData, category: selectedCategory.id });
      loadItemsForCategory(selectedCategory);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async (id: number, updates: Partial<Item>) => {
    try {
      await databaseService.updateItem(id, updates);
      loadItemsForCategory(selectedCategory);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await databaseService.deleteItem(id);
      loadItemsForCategory(selectedCategory);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleItemCheck = async (item: Item) => {
    await handleUpdateItem(item.id!, { isChecked: !item.isChecked });
  };

  const renderCategoryTab = ({ item: category }: { item: ItemCategory }) => {
    const isSelected = selectedCategory.id === category.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryTab,
          {
            backgroundColor: isSelected ? category.color : 'transparent',
            borderColor: category.color,
          }
        ]}
        onPress={() => handleCategoryChange(category)}
      >
        <MaterialIcons
          name={category.icon as any}
          size={20}
          color={isSelected ? 'white' : category.color}
        />
        <Text style={[
          styles.categoryTabText,
          { color: isSelected ? 'white' : category.color }
        ]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Item }) => (
    <ItemCard
      item={item}
      onToggleCheck={() => toggleItemCheck(item)}
      onEdit={() => setEditingItem(item)}
      onDelete={() => handleDeleteItem(item.id!)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name={selectedCategory.icon as any}
        size={80}
        color={selectedCategory.color}
        style={styles.emptyIcon}
      />
      <ThemedText style={styles.emptyTitle}>
        {selectedCategory.name} Eşyası Yok
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Bu kategoriye eşya ekleyerek burada görmek için
      </ThemedText>
      <TouchableOpacity
        style={[styles.addButton, { 
          backgroundColor: 'white',
          borderColor: selectedCategory.color,
          borderWidth: 2,
        }]}
        onPress={() => setShowAddModal(true)}
      >
        <MaterialIcons name="add" size={24} color={selectedCategory.color} />
        <Text style={[styles.addButtonText, { color: selectedCategory.color }]}>Eşya Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  const getRecommendations = (category: ItemCategory) => {
    const recommendations: { [key: string]: string[] } = {
      water: ['Su şişeleri (kişi başı günde 1 galon)', 'Su arıtma tabletleri', 'Taşınabilir su filtresi'],
      food: ['Konserve gıdalar', 'Enerji barları', 'Kuru meyve ve kuruyemiş', 'Bebek maması (gerekirse)'],
      medical: ['İlk yardım çantası', 'Reçeteli ilaçlar', 'Ağrı kesiciler', 'Bandaj', 'Antiseptik'],
      tools: ['El feneri', 'Pilli radyo', 'Çok amaçlı alet', 'Kibrit/çakmak', 'Koli bandı'],
      clothing: ['Yedek giysiler', 'Yağmurluk', 'Sıcak battaniye', 'Sağlam ayakkabı'],
      documents: ['Kimlik kopyaları', 'Sigorta evrakları', 'Nakit para', 'Acil durum iletişim listesi'],
      communication: ['Cep telefonu şarjı', 'Güç kaynağı', 'Acil durum radyosu', 'Düdük'],
      hygiene: ['Diş fırçası/macunu', 'Sabun', 'Tuvalet kağıdı', 'Kadın hijyen ürünleri'],
      other: ['Çöp torbaları', 'Plastik örtü', 'Yerel haritalar', 'Yangın söndürücü'],
    };
    
    return recommendations[category.id] || [];
  };

  const recommendations = getRecommendations(selectedCategory);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Kategoriler</ThemedText>
        <ThemedText style={styles.subtitle}>Acil durum malzemelerini düzenle</ThemedText>
      </ThemedView>

      {/* Category Tabs */}
      <FlatList
        data={ITEM_CATEGORIES}
        renderItem={renderCategoryTab}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
        style={styles.categoryTabsContainer}
      />

      {/* Category Info */}
      <ThemedView style={styles.categoryInfo}>
        <View style={styles.categoryHeader}>
          <MaterialIcons
            name={selectedCategory.icon as any}
            size={24}
            color={selectedCategory.color}
          />
          <ThemedText style={styles.categoryTitle}>{selectedCategory.name}</ThemedText>
          <View style={styles.itemCount}>
            <ThemedText style={styles.itemCountText}>{items.length} eşya</ThemedText>
          </View>
        </View>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.recommendations}>
            <ThemedText style={styles.recommendationsTitle}>Önerilen Eşyalar:</ThemedText>
            {recommendations.slice(0, 3).map((rec, index) => (
              <ThemedText key={index} style={styles.recommendationItem}>
                • {rec}
              </ThemedText>
            ))}
          </View>
        )}
      </ThemedView>

      {/* Items List */}
      {items.length === 0 ? renderEmptyState() : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.itemsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Button */}
      {items.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: selectedCategory.color }]}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      <AddItemModal
        visible={showAddModal || !!editingItem}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        onSave={editingItem ? 
          (itemData) => handleUpdateItem(editingItem.id!, itemData) : 
          handleAddItem
        }
        editingItem={editingItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  categoryTabsContainer: {
    maxHeight: 60,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  categoryInfo: {
    margin: 20,
    marginTop: 10,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  itemCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recommendations: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationItem: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
  itemsList: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 30,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
