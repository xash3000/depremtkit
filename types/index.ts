export interface Item {
  id?: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  notes?: string;
  isChecked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const ITEM_CATEGORIES: ItemCategory[] = [
  { id: 'water', name: 'Water & Drinks', icon: 'local-drink', color: '#4FC3F7' },
  { id: 'food', name: 'Food & Snacks', icon: 'restaurant', color: '#81C784' },
  { id: 'medical', name: 'Medical Supplies', icon: 'medical-services', color: '#E57373' },
  { id: 'tools', name: 'Tools & Equipment', icon: 'build', color: '#FFB74D' },
  { id: 'clothing', name: 'Clothing', icon: 'checkroom', color: '#BA68C8' },
  { id: 'documents', name: 'Documents', icon: 'description', color: '#4DB6AC' },
  { id: 'communication', name: 'Communication', icon: 'phone', color: '#FF8A65' },
  { id: 'hygiene', name: 'Hygiene', icon: 'soap', color: '#90A4AE' },
  { id: 'other', name: 'Other', icon: 'category', color: '#A1887F' },
];
