import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
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
import { notificationRefreshService } from '@/services/notificationRefresh';
import { dateUtils } from '@/services/utils';
import { Item } from '@/types';
import { AddItemModal } from '../../components/AddItemModal';
import AIKitModal from '../../components/AIKitModal';
import { ItemCard } from '../../components/ItemCard';

export default function MyBagScreen() {
  const colorScheme = useColorScheme();
  const [items, setItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const loadItems = async () => {
    try {
      const allItems = await databaseService.getAllItems();
      setItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Hata', 'Eşyalar yüklenemedi');
    } finally {
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
      // Trigger notification refresh
      notificationRefreshService.triggerRefresh();
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Hata', 'Eşya eklenemedi');
    }
  };

  const handleUpdateItem = async (id: number, updates: Partial<Item>) => {
    try {
      await databaseService.updateItem(id, updates);
      loadItems();
      setEditingItem(null);
      // Trigger notification refresh if expiration date might have changed
      if (updates.expirationDate !== undefined) {
        notificationRefreshService.triggerRefresh();
      }
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Hata', 'Eşya güncellenemedi');
    }
  };

  const handleDeleteItem = async (id: number) => {
    Alert.alert(
      'Eşyayı Sil',
      'Bu eşyayı çantandan kaldırmak istediğin emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteItem(id);
              loadItems();
              // Trigger notification refresh
              notificationRefreshService.triggerRefresh();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Hata', 'Eşya silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllItems = async () => {
    Alert.alert(
      'Tüm Eşyaları Sil',
      'Çantandaki tüm eşyaları silmek istediğin emin misin? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tümünü Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteAllItems();
              loadItems();
              // Trigger notification refresh
              notificationRefreshService.triggerRefresh();
            } catch (error) {
              console.error('Error deleting all items:', error);
              Alert.alert('Hata', 'Eşyalar silinemedi');
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
      {/* <View style={styles.emptyBackColor}></View> */}
      <Image
  source={require('../../assets/images/sad.png')}
  style={{ width: 240, height: 240, resizeMode: 'contain',  borderRadius: 175}}
/>
      <ThemedText style={styles.emptyTitle}>Çanta Boş</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Depreme hazırlık eşyalarını ekle. 
        Ürünlerin son kullanım tarihi yaklaştığında sizi bildireceğiz
      </ThemedText>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
        onPress={() => setShowAddModal(true)}
      >
        <MaterialIcons name="add" size={24} color={colorScheme === 'dark' ? 'black' : 'white'} />
        <Text style={[
          styles.addButtonText,
          { color: colorScheme === 'dark' ? "#000" : "#fff"} 
        ]}>
          Ekle
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.title}>Deprem Çantam</ThemedText>
            <ThemedText style={styles.subtitle}>Hazır Ol. Güvende Kal.</ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.aiButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => setShowAIModal(true)}
          >
            <MaterialIcons name="auto-awesome" size={20} color={colorScheme === 'light' ? 'white' : 'black'} />
            <Text style={[styles.aiButtonText, { color: colorScheme === 'light' ? 'white' : 'black' }]}>
              AI Kit
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{stats.totalItems}</ThemedText>
            <ThemedText style={styles.statLabel}>Toplam Eşya</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: '#449BD5' }]}>{stats.checkedItems}</ThemedText>
            <ThemedText style={styles.statLabel}>Kontrol Edildi</ThemedText>
          </View>
          <View style={styles.statItem}>
<ThemedText style={[styles.statNumber, { color: '#449BD5' }]}>
              {stats.expiringItems}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Yakında Bitecek</ThemedText>
          </View>
        </View>
        
        {items.length > 0 && (
          <TouchableOpacity
            style={[styles.deleteAllButton, { borderColor: '#F44336' }]}
            onPress={handleDeleteAllItems}
          >
            <MaterialIcons name="delete-sweep" size={20} color="#F44336" />
            <Text style={[styles.deleteAllButtonText, { color: '#F44336' }]}>
              Tümünü Sil
            </Text>
          </TouchableOpacity>
        )}
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
          <MaterialIcons name="add" size={28} color={colorScheme === 'light' ? 'white' : 'black'} />
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

      <AIKitModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSuccess={() => {
          loadItems();
          Alert.alert(
            'Başarılı!',
            'AI önerileri çantanıza eklendi. Eşyaları görüntülemek ve son kullanma tarihlerini düzenlemek için liste üzerinde çalışabilirsiniz.',
            [{ text: 'Tamam' }]
          );
        }}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 5,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
    marginTop: 16,
    alignSelf: 'center',
  },
  deleteAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
    fontSize: 25,
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
  emptyBackColor:{
    position: 'absolute',
    zIndex: -1,
    alignSelf: 'center',
    top: 75, // Adjust as needed for vertical alignment
    backgroundColor: '#A8D7F7',
    width: 210,
    height: 210,
    borderRadius: 105,
  }
});
