import { databaseService } from '@/services/database';
import { formatDate } from '@/services/utils';
import { Item } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NotificationsScreen() {
  const [expiredItems, setExpiredItems] = useState<Item[]>([]);
  const [expiringSoonItems, setExpiringSoonItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const expired = await databaseService.getExpiredItems();
      const expiringSoon = await databaseService.getExpiringSoonItems();
      setExpiredItems(expired);
      setExpiringSoonItems(expiringSoon);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleDeleteItem = async (itemId: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteItem(itemId);
              await loadNotifications();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const getExpirationStatus = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', days: Math.abs(diffDays), color: '#FF3B30' };
    } else if (diffDays <= 30) {
      return { status: 'expiring', days: diffDays, color: '#FF9500' };
    }
    return { status: 'good', days: diffDays, color: '#34C759' };
  };

  const renderNotificationItem = ({ item }: { item: Item }) => {
    const expStatus = getExpirationStatus(item.expirationDate!);

    return (
      <View style={styles.notificationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item.id!)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.expirationInfo}>
          <Ionicons
            name={expStatus.status === 'expired' ? 'alert-circle' : 'warning'}
            size={16}
            color={expStatus.color}
          />
          <Text style={[styles.expirationText, { color: expStatus.color }]}>
            {expStatus.status === 'expired'
              ? `Expired ${expStatus.days} day${expStatus.days === 1 ? '' : 's'} ago`
              : `Expires in ${expStatus.days} day${expStatus.days === 1 ? '' : 's'}`}
          </Text>
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.detailText}>
            Quantity: {item.quantity} {item.unit}
          </Text>
          <Text style={styles.detailText}>
            Expiration: {formatDate(item.expirationDate!)}
          </Text>
          {item.notes && (
            <Text style={styles.detailText} numberOfLines={2}>
              Notes: {item.notes}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = (title: string, message: string, iconName: string) => (
    <View style={styles.emptyState}>
      <Ionicons name={iconName as any} size={64} color="#8E8E93" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[...expiredItems, ...expiringSoonItems]}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id!.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Alerts & Notifications</Text>
            <Text style={styles.subtitle}>
              Items that need your attention
            </Text>
            
            {expiredItems.length > 0 && (
              <View style={styles.alertSection}>
                <View style={styles.alertHeader}>
                  <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                  <Text style={styles.alertTitle}>Expired Items ({expiredItems.length})</Text>
                </View>
                <Text style={styles.alertDescription}>
                  These items have passed their expiration date and should be replaced immediately.
                </Text>
              </View>
            )}

            {expiringSoonItems.length > 0 && (
              <View style={styles.alertSection}>
                <View style={styles.alertHeader}>
                  <Ionicons name="warning" size={20} color="#FF9500" />
                  <Text style={styles.alertTitle}>Expiring Soon ({expiringSoonItems.length})</Text>
                </View>
                <Text style={styles.alertDescription}>
                  These items will expire within the next 30 days. Consider replacing them soon.
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={renderEmptyState(
          'All Good!',
          'No items need immediate attention. Your emergency bag is up to date.',
          'checkmark-circle'
        )}
        contentContainerStyle={
          expiredItems.length === 0 && expiringSoonItems.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
  },
  alertSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#6D6D70',
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 14,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 4,
  },
  expirationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  expirationText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#6D6D70',
    marginBottom: 4,
  },
});
