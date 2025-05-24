import * as SQLite from 'expo-sqlite';
import { Item } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('depremkit.db');
      
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          quantity INTEGER DEFAULT 1,
          unit TEXT DEFAULT 'pcs',
          expirationDate TEXT,
          notes TEXT,
          isChecked INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async getAllItems(): Promise<Item[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getAllAsync(`
        SELECT * FROM items ORDER BY createdAt DESC
      `);
      
      return result.map((row: any) => ({
        ...row,
        isChecked: Boolean(row.isChecked),
      })) as Item[];
    } catch (error) {
      console.error('Error getting all items:', error);
      return [];
    }
  }

  async getItemsByCategory(category: string): Promise<Item[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getAllAsync(`
        SELECT * FROM items WHERE category = ? ORDER BY createdAt DESC
      `, [category]);
      
      return result.map((row: any) => ({
        ...row,
        isChecked: Boolean(row.isChecked),
      })) as Item[];
    } catch (error) {
      console.error('Error getting items by category:', error);
      return [];
    }
  }

  async addItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const now = new Date().toISOString();
      const result = await this.db.runAsync(`
        INSERT INTO items (name, category, quantity, unit, expirationDate, notes, isChecked, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.name,
        item.category,
        item.quantity,
        item.unit,
        item.expirationDate || null,
        item.notes || null,
        item.isChecked ? 1 : 0,
        now,
        now
      ]);
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  }

  async updateItem(id: number, item: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const now = new Date().toISOString();
      const fields = [];
      const values = [];
      
      if (item.name !== undefined) {
        fields.push('name = ?');
        values.push(item.name);
      }
      if (item.category !== undefined) {
        fields.push('category = ?');
        values.push(item.category);
      }
      if (item.quantity !== undefined) {
        fields.push('quantity = ?');
        values.push(item.quantity);
      }
      if (item.unit !== undefined) {
        fields.push('unit = ?');
        values.push(item.unit);
      }
      if (item.expirationDate !== undefined) {
        fields.push('expirationDate = ?');
        values.push(item.expirationDate);
      }
      if (item.notes !== undefined) {
        fields.push('notes = ?');
        values.push(item.notes);
      }
      if (item.isChecked !== undefined) {
        fields.push('isChecked = ?');
        values.push(item.isChecked ? 1 : 0);
      }
      
      fields.push('updatedAt = ?');
      values.push(now);
      
      values.push(id);
      
      await this.db.runAsync(`
        UPDATE items SET ${fields.join(', ')} WHERE id = ?
      `, values);
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.runAsync('DELETE FROM items WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  async getExpiringItems(daysAhead: number = 7): Promise<Item[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const result = await this.db.getAllAsync(`
        SELECT * FROM items 
        WHERE expirationDate IS NOT NULL 
        AND expirationDate <= ? 
        ORDER BY expirationDate ASC
      `, [futureDateString]);
      
      return result.map((row: any) => ({
        ...row,
        isChecked: Boolean(row.isChecked),
      })) as Item[];
    } catch (error) {
      console.error('Error getting expiring items:', error);
      return [];
    }
  }

  async getExpiredItems(): Promise<Item[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const result = await this.db.getAllAsync(`
        SELECT * FROM items 
        WHERE expirationDate IS NOT NULL 
        AND expirationDate < ? 
        ORDER BY expirationDate ASC
      `, [today]);
      
      return result.map((row: any) => ({
        ...row,
        isChecked: Boolean(row.isChecked),
      })) as Item[];
    } catch (error) {
      console.error('Error getting expired items:', error);
      return [];
    }
  }

  async getExpiringSoonItems(daysAhead: number = 30): Promise<Item[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const result = await this.db.getAllAsync(`
        SELECT * FROM items 
        WHERE expirationDate IS NOT NULL 
        AND expirationDate >= ? 
        AND expirationDate <= ? 
        ORDER BY expirationDate ASC
      `, [today, futureDateString]);
      
      return result.map((row: any) => ({
        ...row,
        isChecked: Boolean(row.isChecked),
      })) as Item[];
    } catch (error) {
      console.error('Error getting expiring soon items:', error);
      return [];
    }
  }
}

export const databaseService = new DatabaseService();
export { DatabaseService };
