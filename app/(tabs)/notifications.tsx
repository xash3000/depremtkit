import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { databaseService } from '@/services/database';
import { notificationRefreshService } from '@/services/notificationRefresh';
import { formatDate, notificationService, translateUnit } from '@/services/utils';
import { Item } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NotificationsScreen() {
  const iconColor = useThemeColor({}, 'icon');
  const cardBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'background');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#3A3A3C' }, 'text');
  const secondaryBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#000000' }, 'background');
  const alertBackgroundColor = useThemeColor({ light: '#F8F9FA', dark: '#2C2C2E' }, 'background');
  
  const [expiredItems, setExpiredItems] = useState<Item[]>([]);
  const [expiringSoonItems, setExpiringSoonItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadNotifications();
    checkNotificationStatus();

    // Register for refresh callbacks from other screens
    const unregister = notificationRefreshService.registerRefreshCallback(() => {
      loadNotifications();
    });

    return () => {
      unregister();
    };
  }, []);

  // Refresh notifications when the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const checkNotificationStatus = async () => {
    try {
      // You can add logic here to check if notifications are currently scheduled
      // For now, we'll assume they're enabled if the app has permission
      const hasPermission = await notificationService.requestPermissions();
      setNotificationsEnabled(hasPermission);
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        const success = await notificationService.initializeNotifications();
        if (success) {
          setNotificationsEnabled(true);
          Alert.alert(
            '✅ Bildirimler Aktifleştirildi',
            'Aylık deprem çantası kontrol bildirimleri başlatıldı.'
          );
        } else {
          Alert.alert(
            'Hata',
            'Bildirimler aktifleştirilemedi. Lütfen uygulama ayarlarından bildirim iznini kontrol edin.'
          );
        }
      } else {
        await notificationService.stopMonthlyCheck();
        setNotificationsEnabled(false);
        Alert.alert(
          '🔕 Bildirimler Devre Dışı',
          'Deprem çantası kontrol bildirimleri durduruldu.'
        );
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Hata', 'Bildirim ayarları değiştirilemedi.');
    }
  };

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
      'Eşyayı Sil',
      'Bu eşyayı silmek istediğin emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteItem(itemId);
              await loadNotifications();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Hata', 'Eşya silinemedi');
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
      <ThemedView style={[styles.notificationCard, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.cardHeader}>
          <View style={styles.itemInfo}>
            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
            <ThemedText style={[styles.itemCategory, { color: iconColor }]}>{item.category}</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item.id!)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={[styles.expirationInfo, { backgroundColor: alertBackgroundColor }]}>
          <Ionicons
            name={expStatus.status === 'expired' ? 'alert-circle' : 'warning'}
            size={16}
            color={expStatus.color}
                    />
          <ThemedText style={[styles.expirationText, { color: expStatus.color }]}>
            {expStatus.status === 'expired'
              ? `${expStatus.days} gün önce süresi doldu`
              : `${expStatus.days} gün sonra süresi dolacak`}
          </ThemedText>
        </View>

        <View style={[styles.itemDetails, { borderTopColor: borderColor }]}>
          <ThemedText style={[styles.detailText, { color: iconColor }]}>
            Miktar: {item.quantity} {translateUnit(item.unit)}
          </ThemedText>
          <ThemedText style={[styles.detailText, { color: iconColor }]}>
            Son Kullanma: {formatDate(item.expirationDate!)}
          </ThemedText>
          {item.notes && (
            <ThemedText style={[styles.detailText, { color: iconColor }]} numberOfLines={2}>
              Notlar: {item.notes}
            </ThemedText>
          )}
        </View>
      </ThemedView>
    );
  };
  const renderEmptyState = (title: string, message: string, iconName: string) => (
    <View style={styles.emptyState}>
      {/* <View style={styles.emptyBackColor}></View> */}
      <Image
        source={require('../../assets/images/welcome.png')}
        style={{ width: 250, height: 250, resizeMode: 'contain' }}
      />
      <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
      <ThemedText style={[styles.emptyMessage, { color: iconColor }]}>{message}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: secondaryBackgroundColor }]}>
      <FlatList
        data={[...expiredItems, ...expiringSoonItems]}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id!.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <ThemedView style={[styles.header, { backgroundColor: cardBackgroundColor, borderBottomColor: borderColor }]}>
            <ThemedText style={styles.title}>Uyarılar ve Bildirimler</ThemedText>
            <ThemedText style={[styles.subtitle, { color: iconColor }]}>
              Dikkat gerektiren eşyalar
            </ThemedText>
            
            {/* Notification Settings Section */}
            <View style={[styles.settingsSection, { backgroundColor: alertBackgroundColor }]}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications" size={20} color={iconColor} />
                  <View style={styles.settingTextContainer}>
                    <ThemedText style={styles.settingTitle}>Otomatik Kontrol Bildirimleri</ThemedText>
                    <ThemedText style={[styles.settingDescription, { color: iconColor }]}>
                      Aylık olarak deprem çantası kontrolü için bildirim alın
                    </ThemedText>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                  thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>
            
            {expiredItems.length > 0 && (
              <View style={[styles.alertSection, { backgroundColor: alertBackgroundColor }]}>
                <View style={styles.alertHeader}>
                  <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                  <ThemedText style={styles.alertTitle}>Süresi Geçen Eşyalar ({expiredItems.length})</ThemedText>
                </View>
                <ThemedText style={[styles.alertDescription, { color: iconColor }]}>
                  Bu eşyaların son kullanma tarihi geçmiştir ve hemen değiştirilmelidir.
                </ThemedText>
              </View>
            )}

            {expiringSoonItems.length > 0 && (
              <View style={[styles.alertSection, { backgroundColor: alertBackgroundColor }]}>
                <View style={styles.alertHeader}>
                  <Ionicons name="warning" size={20} color="#FF9500" />
                  <ThemedText style={styles.alertTitle}>Yakında Bitecek ({expiringSoonItems.length})</ThemedText>
                </View>
                <ThemedText style={[styles.alertDescription, { color: iconColor }]}>
                  Bu eşyaların süresi önümüzdeki 30 gün içinde dolacak. Yakında değiştirmeyi düşünün.
                </ThemedText>
              </View>
            )}
          </ThemedView>
        }
        ListEmptyComponent={renderEmptyState(
          'Her Şey Yolunda!',
          'Hiçbir eşya acil dikkat gerektirmiyor. deprem çantan güncel.',
          'checkmark-circle'
        )}
        contentContainerStyle={
          expiredItems.length === 0 && expiringSoonItems.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  alertSection: {
    marginBottom: 10,
    padding: 12,
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
    marginLeft: 8,
  },
  alertDescription: {
    fontSize: 14,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationCard: {
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
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 14,
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
    borderRadius: 6,
  },
  expirationText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  itemDetails: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  settingsSection: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyBackColor:{
    position: 'absolute',
    zIndex: -1,
    alignSelf: 'center',
    top: 90, // Adjust as needed for vertical alignment
    backgroundColor: '#A8D7F7',
    width: 210,
    height: 210,
    borderRadius: 105,
  }
});
