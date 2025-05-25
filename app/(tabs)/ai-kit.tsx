import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AIKitModal from '@/components/AIKitModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AIKitScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [showAIModal, setShowAIModal] = useState(false);

  const handleAISuccess = () => {
    Alert.alert(
      'Başarılı!',
      'AI önerileri çantanıza eklendi. Ana sayfada yeni eşyaları görüntüleyebilir ve düzenleyebilirsiniz.',
      [{ text: 'Tamam' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="auto-awesome" size={32} color={colors.tint} />
          <ThemedText style={styles.title}>AI Deprem Çantası</ThemedText>
          <ThemedText style={styles.subtitle}>
            Yapay zeka ile kişiselleştirilmiş deprem hazırlık önerileri
          </ThemedText>
        </View>
      </ThemedView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Main CTA */}
        <View style={styles.ctaContainer}>
          <View style={styles.ctaContent}>
            <Image
                source={require('../../assets/images/ai.png')}
                style={{ width: 250, height: 250, resizeMode: 'contain'}}
            />
            <Text style={[styles.ctaTitle, { color: colors.text }]}>
              Akıllı Deprem Çantası Oluştur
            </Text>
            <Text style={[styles.ctaDescription, { color: colors.text }]}>
              Size özel sorular yanıtlayarak, yaşam koşullarınıza ve ihtiyaçlarınıza göre 
              AI tarafından hazırlanmış deprem çantası önerileri alın.
            </Text>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.tint }]}
              onPress={() => setShowAIModal(true)}
            >
              <MaterialIcons name="auto-awesome" size={24} color="white" />
              <Text style={styles.ctaButtonText}>AI Kit Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <AIKitModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSuccess={handleAISuccess}
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
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    justifyContent: 'center',
  },
  ctaContainer: {
    marginBottom: 32,
  },
  ctaContent: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  ctaIcon: {
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
