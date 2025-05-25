import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { testingUtils } from '@/services/testingUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DemoScreen() {
  const cardBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'background');
  const secondaryBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#000000' }, 'background');
  const iconColor = useThemeColor({}, 'icon');

  // Function to schedule kit check notification (exact Turkish text from utils.ts)
  const scheduleKitCheckDemo = async () => {
    try {
      await testingUtils.scheduleTestNotification(5, {
        title: '🎒 Deprem Çantası Kontrolü',
        body: 'Deprem çantanızdaki ürünleri kontrol etme zamanı geldi!',
      });
      
      Alert.alert(
        '⏰ Kit Kontrolü Zamanlandı',
        '5 saniye sonra Deprem Çantası Kontrolü bildirimi gelecek'
      );
    } catch (error) {
      console.error('Error scheduling kit check:', error);
      Alert.alert('Hata', 'Bildirim zamanlanamadı');
    }
  };

  // Function to schedule expiring item notification (exact Turkish text from utils.ts)
  const scheduleExpiringItemDemo = async () => {
    try {
      await testingUtils.scheduleTestNotification(5, {
        title: '⚠️ Son Kullanma Tarihi Yaklaşıyor',
        body: 'Su ürününün son kullanma tarihi 3 gün sonra sona eriyor.',
      });

      Alert.alert(
        '⚠️ Son Kullanma Uyarısı Zamanlandı',
        '5 saniye sonra Son Kullanma Tarihi Yaklaşıyor bildirimi gelecek'
      );
    } catch (error) {
      console.error('Error scheduling expiring item notification:', error);
      Alert.alert('Hata', 'Bildirim zamanlanamadı');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: secondaryBackgroundColor }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <ThemedView style={[styles.header, { backgroundColor: cardBackgroundColor }]}>
          <View style={styles.headerContent}>
            <Ionicons name="flask" size={32} color="#FF6B35" />
            <ThemedText style={styles.title}>Demo</ThemedText>
          </View>
        </ThemedView>

        {/* Demo Buttons */}
        <ThemedView style={[styles.buttonsCard, { backgroundColor: cardBackgroundColor }]}>
          <ThemedText style={styles.cardTitle}>Demo Bildirimleri</ThemedText>
          
          {/* Kit Check Notification */}
          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: '#34C759' }]}
            onPress={scheduleKitCheckDemo}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="cube" size={24} color="#FFFFFF" />
              <View style={styles.buttonTextContainer}>
                <ThemedText style={styles.buttonTitle}>Kit Kontrolü Bildirimi</ThemedText>
                <ThemedText style={styles.buttonSubtitle}>
                  🎒 Deprem Çantası Kontrolü - 5 saniye sonra
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          {/* Expiring Item Notification */}
          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: '#FF9500' }]}
            onPress={scheduleExpiringItemDemo}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="warning" size={24} color="#FFFFFF" />
              <View style={styles.buttonTextContainer}>
                <ThemedText style={styles.buttonTitle}>Son Kullanma Uyarısı</ThemedText>
                <ThemedText style={styles.buttonSubtitle}>
                  ⚠️ Son Kullanma Tarihi Yaklaşıyor - 5 saniye sonra
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  demoButton: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  instructionsCard: {
    padding: 16,
    borderRadius: 12,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsList: {
    paddingLeft: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: '600',
    width: 20,
    color: '#007AFF',
  },
  instructionText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
