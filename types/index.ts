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
  { id: 'water', name: 'Su ve İçecekler', icon: 'local-drink', color: '#4FC3F7' },
  { id: 'food', name: 'Gıda ve Atıştırmalık', icon: 'restaurant', color: '#81C784' },
  { id: 'medical', name: 'Tıbbi Malzemeler', icon: 'medical-services', color: '#E57373' },
  { id: 'tools', name: 'Araç ve Ekipman', icon: 'build', color: '#FFB74D' },
  { id: 'clothing', name: 'Giyim', icon: 'checkroom', color: '#BA68C8' },
  { id: 'documents', name: 'Belgeler', icon: 'description', color: '#4DB6AC' },
  { id: 'communication', name: 'İletişim', icon: 'phone', color: '#FF8A65' },
  { id: 'hygiene', name: 'Hijyen', icon: 'soap', color: '#90A4AE' },
  { id: 'other', name: 'Diğer', icon: 'category', color: '#A1887F' },
];
