import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { testingUtils } from '@/services/testingUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TestingScreen() {
  const cardBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'background');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#3A3A3C' }, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const [isLoading, setIsLoading] = useState(false);

  const testActions = [
    {
      title: 'Test Verilerini Ekle',
      description: 'Farklı son kullanma tarihlerine sahip test eşyalar ekler',
      icon: 'add-circle',
      color: '#007AFF',
      action: async () => {
        await testingUtils.addTestItems();
        Alert.alert('✅ Başarılı', 'Test verileri eklendi. Bildirimler sekmesini kontrol edin.');
      },
    },
    {
      title: 'Hemen Kontrol Et',
      description: 'Periyodik kontrol fonksiyonunu manuel olarak tetikler',
      icon: 'refresh',
      color: '#FF9500',
      action: async () => {
        await testingUtils.triggerPeriodicCheck();
        Alert.alert('✅ Kontrol Tamamlandı', 'Periyodik kontrol çalıştırıldı');
      },
    },
    {
      title: '5 Saniye Test Bildirimi',
      description: '5 saniye sonra gelecek test bildirimi zamanlar',
      icon: 'time',
      color: '#34C759',
      action: async () => {
        await testingUtils.scheduleTestNotification(5);
        Alert.alert('⏰ Zamanlandı', '5 saniye sonra test bildirimi gelecek');
      },
    },
    {
      title: '30 Saniye Test Bildirimi',
      description: '30 saniye sonra gelecek test bildirimi zamanlar',
      icon: 'timer',
      color: '#5856D6',
      action: async () => {
        await testingUtils.scheduleTestNotification(30);
        Alert.alert('⏰ Zamanlandı', '30 saniye sonra test bildirimi gelecek');
      },
    },
    {
      title: 'Son Kullanma Uyarısı (10s)',
      description: '10 saniye sonra son kullanma uyarısı gönderir',
      icon: 'warning',
      color: '#FF3B30',
      action: async () => {
        await testingUtils.scheduleTestExpirationReminder('Test Ürünü', 10);
        Alert.alert('⚠️ Zamanlandı', '10 saniye sonra son kullanma uyarısı gelecek');
      },
    },
    {
      title: 'Hızlı Periyodik Kontrol (1dk)',
      description: 'Her dakika tetiklenen test periyodik kontrol başlatır',
      icon: 'repeat',
      color: '#FF6B35',
      action: async () => {
        const id = await testingUtils.scheduleFastPeriodicCheck();
        Alert.alert(
          '🚀 Hızlı Kontrol Başlatıldı',
          'Her dakika periyodik kontrol tetiklenecek. Demo sonrası "Bildirimleri Temizle" butonuna basın!'
        );
      },
    },
    {
      title: 'Debug Bilgileri',
      description: 'Geçerli bildirim durumunu ve istatistikleri gösterir',
      icon: 'information-circle',
      color: '#6C757D',
      action: async () => {
        await testingUtils.getNotificationStats();
        await testingUtils.showScheduledNotifications();
        Alert.alert('📊 Debug Bilgileri', 'Detaylar konsol loguna yazdırıldı. Metro bundler terminalini kontrol edin.');
      },
    },
    {
      title: 'Bildirimleri Temizle',
      description: 'Tüm zamanlanmış bildirimleri iptal eder',
      icon: 'trash',
      color: '#FF3B30',
      action: async () => {
        await testingUtils.clearTestData();
        Alert.alert('🗑️ Temizlendi', 'Tüm zamanlanmış bildirimler iptal edildi');
      },
    },
  ];

  const handleTestAction = async (action: () => Promise<void>) => {
    try {
      setIsLoading(true);
      await action();
    } catch (error) {
      console.error('Test action error:', error);
      Alert.alert('Hata', 'Test işlemi sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: cardBackgroundColor, borderBottomColor: borderColor }]}>
          <ThemedText style={styles.title}>🧪 Bildirim Test Araçları</ThemedText>
          <ThemedText style={[styles.subtitle, { color: iconColor }]}>
            Demo video çekimi için test araçları
          </ThemedText>
        </View>

        <View style={[styles.warningCard, { backgroundColor: '#FFF3CD', borderColor: '#FFC107' }]}>
          <Ionicons name="warning" size={20} color="#856404" />
          <View style={styles.warningContent}>
            <Text style={[styles.warningTitle, { color: '#856404' }]}>Demo Modu</Text>
            <Text style={[styles.warningText, { color: '#856404' }]}>
              Bu araçlar sadece demo ve test amaçlıdır. Gerçek zamanlı bildirimleri test etmek için kullanın.
            </Text>
          </View>
        </View>

        {testActions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.testCard, { backgroundColor: cardBackgroundColor, borderColor }]}
            onPress={() => handleTestAction(item.action)}
            disabled={isLoading}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                <ThemedText style={[styles.cardDescription, { color: iconColor }]}>
                  {item.description}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={iconColor} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.spacer} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  testCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  spacer: {
    height: 32,
  },
});
