import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { dateUtils } from '@/services/utils';
import { Item, ITEM_CATEGORIES } from '@/types';

interface ItemCardProps {
  item: Item;
  onToggleCheck: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemCard({ item, onToggleCheck, onEdit, onDelete }: ItemCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const category = ITEM_CATEGORIES.find(cat => cat.id === item.category);
  const categoryColor = category?.color || '#666';
  
  const getExpirationStatus = () => {
    if (!item.expirationDate) return null;
    
    const daysUntil = dateUtils.getDaysUntilExpiration(item.expirationDate);
    
    if (dateUtils.isExpired(item.expirationDate)) {
      return { text: 'Expired', color: '#F44336', urgent: true };
    } else if (dateUtils.isExpiringSoon(item.expirationDate, 7)) {
      return { text: `${daysUntil} days left`, color: '#FF9800', urgent: true };
    } else if (dateUtils.isExpiringSoon(item.expirationDate, 30)) {
      return { text: `${daysUntil} days left`, color: '#FFC107', urgent: false };
    }
    
    return { text: dateUtils.formatDate(item.expirationDate), color: '#4CAF50', urgent: false };
  };

  const expirationStatus = getExpirationStatus();

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isDark ? '#2C2C2E' : 'white',
        borderColor: isDark ? '#3C3C3E' : '#E1E1E1',
      }
    ]}>
      {/* Category indicator */}
      <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                { 
                  backgroundColor: item.isChecked ? '#4CAF50' : 'transparent',
                  borderColor: item.isChecked ? '#4CAF50' : (isDark ? '#666' : '#CCC'),
                }
              ]}
              onPress={onToggleCheck}
            >
              {item.isChecked && (
                <MaterialIcons name="check" size={16} color="white" />
              )}
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <ThemedText style={[
                styles.title,
                item.isChecked && styles.checkedTitle
              ]}>
                {item.name}
              </ThemedText>
              
              {category && (
                <View style={styles.categoryBadge}>
                  <MaterialIcons 
                    name={category.icon as any} 
                    size={12} 
                    color={categoryColor} 
                  />
                  <Text style={[styles.categoryText, { color: categoryColor }]}>
                    {category.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <MaterialIcons 
                name="edit" 
                size={20} 
                color={isDark ? '#A0A0A0' : '#666'} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <MaterialIcons 
                name="delete-outline" 
                size={20} 
                color="#F44336" 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Quantity */}
        <View style={styles.quantityRow}>
          <MaterialIcons 
            name="inventory" 
            size={16} 
            color={isDark ? '#A0A0A0' : '#666'} 
          />
          <ThemedText style={styles.quantity}>
            Quantity: {item.quantity}
          </ThemedText>
        </View>
        
        {/* Expiration */}
        {expirationStatus && (
          <View style={styles.expirationRow}>
            <MaterialIcons 
              name={expirationStatus.urgent ? "warning" : "schedule"} 
              size={16} 
              color={expirationStatus.color} 
            />
            <Text style={[styles.expiration, { color: expirationStatus.color }]}>
              {expirationStatus.text}
            </Text>
          </View>
        )}
        
        {/* Notes */}
        {item.notes && (
          <View style={styles.notesRow}>
            <MaterialIcons 
              name="note" 
              size={16} 
              color={isDark ? '#A0A0A0' : '#666'} 
            />
            <ThemedText style={styles.notes} numberOfLines={2}>
              {item.notes}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIndicator: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantity: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.8,
  },
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  expiration: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notes: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.8,
    flex: 1,
    lineHeight: 18,
  },
});
