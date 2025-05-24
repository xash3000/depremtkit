import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { databaseService } from '@/services/database';
import { dateUtils } from '@/services/utils';
import { Item } from '@/types';
import { AddItemModal } from '../../components/AddItemModal';
import { ItemCard } from '../../components/ItemCard';

export default function MyBagScreen() {
  const colorScheme = useColorScheme();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const loadItems = async () => {
    try {
      const allItems = await databaseService.getAllItems();
      setItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handleAddItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await databaseService.addItem(itemData);
      loadItems();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleUpdateItem = async (id: number, updates: Partial<Item>) => {
    try {
      await databaseService.updateItem(id, updates);
      loadItems();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from your bag?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteItem(id);
              loadItems();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const toggleItemCheck = async (item: Item) => {
    await handleUpdateItem(item.id!, { isChecked: !item.isChecked });
  };

  const getItemStats = () => {
    const totalItems = items.length;
    const checkedItems = items.filter(item => item.isChecked).length;
    const expiringItems = items.filter(item => 
      item.expirationDate && dateUtils.isExpiringSoon(item.expirationDate)
    ).length;
    
    return { totalItems, checkedItems, expiringItems };
  };

  const stats = getItemStats();

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
      <MaterialIcons name="backpack" size={80} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
      <ThemedText style={styles.emptyTitle}>Your Emergency Bag is Empty</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Start building your earthquake preparedness kit by adding essential items
      </ThemedText>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
        onPress={() => setShowAddModal(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add First Item</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>My Emergency Bag</ThemedText>
        <ThemedText style={styles.subtitle}>Stay Ready. Stay Safe.</ThemedText>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{stats.totalItems}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Items</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.checkedItems}</ThemedText>
            <ThemedText style={styles.statLabel}>Checked</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: stats.expiringItems > 0 ? '#FF9800' : '#4CAF50' }]}>
              {stats.expiringItems}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Expiring Soon</ThemedText>
          </View>
        </View>
      </ThemedView>

      {items.length === 0 ? renderEmptyState() : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {items.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
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
          (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => handleUpdateItem(editingItem.id!, itemData) : 
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
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    lineHeight: 22,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: 'white',
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
