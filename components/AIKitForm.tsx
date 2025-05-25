import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { databaseService } from '@/services/database';
import { AIKitRequest, geminiService } from '@/services/geminiService';
import { ITEM_CATEGORIES } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AIKitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AIKitForm({ onSuccess, onCancel }: AIKitFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AIKitRequest>({
    householdSize: 2,
    hasChildren: false,
    hasPets: false,
    hasElderly: false,
    hasChronicIllness: false,
    medicationNeeds: '',
    dietaryRestrictions: '',
    livingArea: 'apartment',
    priorityCategories: [],
  });

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      priorityCategories: prev.priorityCategories.includes(categoryId)
        ? prev.priorityCategories.filter(id => id !== categoryId)
        : [...prev.priorityCategories, categoryId]
    }));
  };

  const handleSubmit = async () => {
    if (formData.priorityCategories.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir öncelikli kategori seçin.');
      return;
    }

    setLoading(true);
    try {
      // Use AI service for demo response that appears AI-generated
      const response = await geminiService.generateEarthquakeKit(formData);

      // Önerilen eşyaları veritabanına ekle
      let addedCount = 0;
      for (const item of response.items) {
        try {
          await databaseService.addItem({
            ...item,
            expirationDate: item.expirationDate || undefined,
            isChecked: false,
          });
          addedCount++;
        } catch (error) {
          console.error('Error adding item:', error);
        }
      }

      Alert.alert(
        'Başarılı!',
        `AI tarafından ${addedCount} eşya önerildi ve çantanıza eklendi.\n\n${response.explanation}\n\nEşyaları görüntülemek ve düzenlemek için ana sayfaya gidin.`,
        [
          {
            text: 'Tamam',
            onPress: onSuccess,
          },
        ]
      );
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>AI Deprem Çantası</Text>
      </View>

      <View style={styles.form}>
        {/* Hane Bilgileri */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hane Bilgileri</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Hane Büyüklüğü</Text>
            <TextInput
              style={[styles.numberInput, { borderColor: colors.icon, color: colors.text }]}
              value={formData.householdSize.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, householdSize: parseInt(text) || 1 }))}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Çocuk var</Text>
            <Switch
              value={formData.hasChildren}
              onValueChange={(value) => setFormData(prev => ({ ...prev, hasChildren: value }))}
              trackColor={{ false: colors.icon, true: colors.tint }}
              thumbColor={formData.hasChildren ? colors.background : colors.text}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Evcil hayvan var</Text>
            <Switch
              value={formData.hasPets}
              onValueChange={(value) => setFormData(prev => ({ ...prev, hasPets: value }))}
              trackColor={{ false: colors.icon, true: colors.tint }}
              thumbColor={formData.hasPets ? colors.background : colors.text}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Yaşlı birey var</Text>
            <Switch
              value={formData.hasElderly}
              onValueChange={(value) => setFormData(prev => ({ ...prev, hasElderly: value }))}
              trackColor={{ false: colors.icon, true: colors.tint }}
              thumbColor={formData.hasElderly ? colors.background : colors.text}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Kronik hastalık var</Text>
            <Switch
              value={formData.hasChronicIllness}
              onValueChange={(value) => setFormData(prev => ({ ...prev, hasChronicIllness: value }))}
              trackColor={{ false: colors.icon, true: colors.tint }}
              thumbColor={formData.hasChronicIllness ? colors.background : colors.text}
            />
          </View>
        </View>

        {/* Özel İhtiyaçlar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Özel İhtiyaçlar</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>İlaç İhtiyaçları</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.icon, color: colors.text }]}
              value={formData.medicationNeeds}
              onChangeText={(text) => setFormData(prev => ({ ...prev, medicationNeeds: text }))}
              placeholder="Özel ilaçlar, tıbbi cihazlar vb."
              placeholderTextColor={colors.text + '80'}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Diyet Kısıtlamaları</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.icon, color: colors.text }]}
              value={formData.dietaryRestrictions}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dietaryRestrictions: text }))}
              placeholder="Alerjiler, vejetaryenlik vb."
              placeholderTextColor={colors.text + '80'}
              multiline
            />
          </View>
        </View>

        {/* Yaşam Koşulları */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Yaşam Koşulları</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Yaşam Alanı</Text>
          <View style={styles.optionGroup}>
            {[
              { key: 'apartment', label: 'Apartman Dairesi' },
              { key: 'house', label: 'Müstakil Ev' },
              { key: 'other', label: 'Diğer' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  { borderColor: colors.icon },
                  formData.livingArea === option.key && { backgroundColor: colors.tint }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, livingArea: option.key as any }))}
              >
                <Text style={[
                  styles.optionText,
                  { color: colors.text },
                  formData.livingArea === option.key && { color: colors.background }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Öncelikli Kategoriler */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Öncelikli Kategoriler</Text>
          <Text style={[styles.helpText, { color: colors.text + '80' }]}>
            AI&apos;nın odaklanmasını istediğiniz kategorileri seçin
          </Text>
          
          <View style={styles.categoryGrid}>
            {ITEM_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { borderColor: colors.icon },
                  formData.priorityCategories.includes(category.id) && { backgroundColor: category.color }
                ]}
                onPress={() => handleCategoryToggle(category.id)}
              >
                <MaterialIcons
                  name={category.icon as any}
                  size={24}
                  color={formData.priorityCategories.includes(category.id) ? 'white' : colors.text}
                />
                <Text style={[
                  styles.categoryText,
                  { color: colors.text },
                  formData.priorityCategories.includes(category.id) && { color: 'white' }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.submitText, { color: colors.background }]}>
              AI Önerilerini Oluştur
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '48%',
    minHeight: 80,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  helpText: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
