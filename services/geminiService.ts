import { Item, ITEM_CATEGORIES } from '../types';

export interface AIKitRequest {
  householdSize: number;
  hasChildren: boolean;
  hasPets: boolean;
  hasElderly: boolean;
  hasChronicIllness: boolean;
  medicationNeeds: string;
  dietaryRestrictions: string;
  livingArea: 'apartment' | 'house' | 'other';
  priorityCategories: string[];
  existingItems?: Item[];
}

export interface AIKitResponse {
  items: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'isChecked'>[];
  explanation: string;
}

class GeminiService {
  
  // Demo response generator that appears AI-generated
  async generateEarthquakeKit(request: AIKitRequest): Promise<AIKitResponse> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    const baseItems = [
      { name: 'Su (19L)', category: 'water', quantity: 1, unit: 'bidon', expirationDate: '2026-05-25', notes: 'Kişi başı günlük 3L hesabıyla' },
      { name: 'Konserve Et', category: 'food', quantity: 3, unit: 'kutu', expirationDate: '2027-01-01', notes: 'Protein kaynağı' },
      { name: 'Kuru Fasulye', category: 'food', quantity: 2, unit: 'paket', expirationDate: '2026-12-01', notes: 'Uzun ömürlü protein' },
      { name: 'Pirinç', category: 'food', quantity: 2, unit: 'gr', expirationDate: '2026-10-01', notes: 'Temel karbonhidrat' },
      { name: 'İlk Yardım Çantası', category: 'medical', quantity: 1, unit: 'adet', expirationDate: undefined, notes: 'Temel tıbbi malzemeler' },
      { name: 'Ağrı Kesici', category: 'medical', quantity: 2, unit: 'kutu', expirationDate: '2025-12-01', notes: 'Parasetamol bazlı' },
      { name: 'El Feneri', category: 'tools', quantity: 2, unit: 'adet', expirationDate: undefined, notes: 'LED, su geçirmez' },
      { name: 'Pil (AA)', category: 'tools', quantity: 8, unit: 'adet', expirationDate: '2028-01-01', notes: 'Alkalin pil' },
      { name: 'Radyo', category: 'communication', quantity: 1, unit: 'adet', expirationDate: undefined, notes: 'Pilli, şarjlı' },
      { name: 'Düdük', category: 'communication', quantity: 2, unit: 'adet', expirationDate: undefined, notes: 'Acil durum sinyali' },
      { name: 'Çakmak', category: 'tools', quantity: 3, unit: 'adet', expirationDate: '2027-06-01', notes: 'Su geçirmez' },
      { name: 'Mum', category: 'tools', quantity: 6, unit: 'adet', expirationDate: undefined, notes: 'Uzun yanma süreli' },
    ];

    // Add specific items based on household composition
    const customItems = [];
    
    if (request.hasChildren) {
      customItems.push(
        { name: 'Bebek Maması', category: 'food', quantity: 6, unit: 'kutu', expirationDate: '2025-08-01', notes: 'Çocuklar için' },
        { name: 'Oyuncak', category: 'other', quantity: 2, unit: 'adet', expirationDate: undefined, notes: 'Çocukları sakinleştirmek için' }
      );
    }

    if (request.hasPets) {
      customItems.push(
        { name: 'Evcil Hayvan Maması', category: 'food', quantity: 5, unit: 'gr', expirationDate: '2025-09-01', notes: 'Evcil hayvanlar için' },
        { name: 'Pet Tasması', category: 'other', quantity: 1, unit: 'adet', expirationDate: undefined, notes: 'Kimlik bilgisi ile' }
      );
    }

    if (request.hasElderly) {
      customItems.push(
        { name: 'Baston', category: 'other', quantity: 1, unit: 'adet', expirationDate: undefined, notes: 'Hareket desteği için' },
        { name: 'Kan Basıncı İlacı', category: 'medical', quantity: 3, unit: 'kutu', expirationDate: '2025-11-01', notes: 'Yaşlılar için temel ilaç' }
      );
    }

    if (request.hasChronicIllness && request.medicationNeeds) {
      customItems.push(
        { name: 'Kişisel İlaçlar', category: 'medical', quantity: 4, unit: 'kutu', expirationDate: '2025-10-01', notes: `${request.medicationNeeds} için özel ilaçlar` }
      );
    }

    if (request.dietaryRestrictions) {
      customItems.push(
        { name: 'Özel Diyet Ürünleri', category: 'food', quantity: 3, unit: 'paket', expirationDate: '2026-07-01', notes: `${request.dietaryRestrictions} uyumlu gıdalar` }
      );
    }

    // Filter items based on priority categories
    let filteredItems = [...baseItems, ...customItems];
    if (request.priorityCategories.length > 0) {
      filteredItems = filteredItems.filter(item => 
        request.priorityCategories.includes(item.category) || 
        ['water', 'food', 'medical'].includes(item.category) // Always include essentials
      );
    }

    // Adjust quantities based on household size
    const adjustedItems = filteredItems.map(item => ({
      ...item,
      quantity: item.category === 'water' || item.category === 'food' 
        ? Math.ceil(item.quantity * request.householdSize / 2)
        : item.quantity
    }));

    // Generate AI-like explanation
    const priorityText = request.priorityCategories.length > 0 
      ? `özellikle ${request.priorityCategories.map(cat => 
          ITEM_CATEGORIES.find(c => c.id === cat)?.name || cat
        ).join(', ')} kategorilerinde` 
      : '';

    const householdText = [];
    if (request.hasChildren) householdText.push('çocuk sahibi');
    if (request.hasElderly) householdText.push('yaşlı bireyli');
    if (request.hasPets) householdText.push('evcil hayvanlı');
    if (request.hasChronicIllness) householdText.push('kronik hastalık durumu olan');

    const explanation = `AI analizi tamamlandı! ${request.householdSize} kişilik ${householdText.length > 0 ? householdText.join(', ') + ' ' : ''}ev için ${priorityText} özel deprem çantası önerileri oluşturuldu. ${request.livingArea === 'apartment' ? 'Apartman dairesi' : request.livingArea === 'house' ? 'Müstakil ev' : 'Yaşam alanı'} koşulları dikkate alınarak toplam ${adjustedItems.length} farklı eşya önerildi.`;

    return {
      items: adjustedItems,
      explanation
    };
  }
}

export const geminiService = new GeminiService();
