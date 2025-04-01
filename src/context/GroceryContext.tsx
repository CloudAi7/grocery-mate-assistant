
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, GroceryItem } from '@/types/groceryTypes';
import { 
  fetchCategories, 
  fetchItems, 
  addCategory, 
  addItem, 
  deleteCategory, 
  deleteItem, 
  updateItemQuantity,
  processVoiceCommand
} from '@/services/supabaseService';

interface GroceryContextType {
  categories: Category[];
  loadingCategories: boolean;
  items: Record<string, GroceryItem[]>;
  loadingItems: boolean;
  refreshCategories: () => Promise<void>;
  refreshItems: (categoryId: string) => Promise<void>;
  createCategory: (name: string, imageUrl: string) => Promise<Category | null>;
  createItem: (name: string, categoryId: string) => Promise<GroceryItem | null>;
  removeCategory: (categoryId: string) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  handleVoiceCommand: (command: string) => Promise<boolean>;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export const useGrocery = () => {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
};

export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [items, setItems] = useState<Record<string, GroceryItem[]>>({});
  const [loadingItems, setLoadingItems] = useState(false);

  const refreshCategories = async () => {
    setLoadingCategories(true);
    const data = await fetchCategories();
    setCategories(data);
    setLoadingCategories(false);
  };

  const refreshItems = async (categoryId: string) => {
    setLoadingItems(true);
    const data = await fetchItems(categoryId);
    setItems(prev => ({ ...prev, [categoryId]: data }));
    setLoadingItems(false);
  };

  const createCategory = async (name: string, imageUrl: string) => {
    const newCategory = await addCategory(name, imageUrl);
    if (newCategory) {
      await refreshCategories();
      return newCategory;
    }
    return null;
  };

  const createItem = async (name: string, categoryId: string) => {
    const newItem = await addItem(name, categoryId);
    if (newItem) {
      await refreshItems(categoryId);
      return newItem;
    }
    return null;
  };

  const removeCategory = async (categoryId: string) => {
    const success = await deleteCategory(categoryId);
    if (success) {
      await refreshCategories();
      // Also remove the items from local state
      setItems(prev => {
        const newItems = { ...prev };
        delete newItems[categoryId];
        return newItems;
      });
    }
    return success;
  };

  const removeItem = async (itemId: string) => {
    const success = await deleteItem(itemId);
    if (success) {
      // Update local state by removing the deleted item
      setItems(prev => {
        const newItems = { ...prev };
        
        // Find which category contains this item
        for (const categoryId in newItems) {
          newItems[categoryId] = newItems[categoryId].filter(item => item.id !== itemId);
        }
        
        return newItems;
      });
    }
    return success;
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const success = await updateItemQuantity(itemId, quantity);
    if (success) {
      // Update local state with the new quantity
      setItems(prev => {
        const newItems = { ...prev };
        
        // Find and update the item in its category
        for (const categoryId in newItems) {
          newItems[categoryId] = newItems[categoryId].map(item => 
            item.id === itemId ? { ...item, quantity } : item
          );
        }
        
        return newItems;
      });
    }
    return success;
  };

  const handleVoiceCommand = async (command: string) => {
    const result = await processVoiceCommand(command);
    
    // Refresh data after processing the command
    await refreshCategories();
    
    // Also refresh items for each known category
    for (const category of categories) {
      await refreshItems(category.id);
    }
    
    return result;
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  return (
    <GroceryContext.Provider value={{
      categories,
      loadingCategories,
      items,
      loadingItems,
      refreshCategories,
      refreshItems,
      createCategory,
      createItem,
      removeCategory,
      removeItem,
      updateQuantity,
      handleVoiceCommand
    }}>
      {children}
    </GroceryContext.Provider>
  );
};
