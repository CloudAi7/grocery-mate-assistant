
import { toast } from 'sonner';
import { Category, GroceryItem } from '@/types/groceryTypes';
import { v4 as uuidv4 } from 'uuid';

// Mock data storage using localStorage
const getLocalStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return [];
  }
};

const setLocalStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const categories = getLocalStorage<Category>('categories');
    console.log('Fetched categories:', categories);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Failed to load categories');
    return [];
  }
};

export const addCategory = async (name: string, imageUrl: string = ''): Promise<Category | null> => {
  try {
    const categories = getLocalStorage<Category>('categories');
    const newCategory = {
      id: uuidv4(),
      name,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };
    
    categories.push(newCategory);
    setLocalStorage('categories', categories);
    
    toast.success(`Added category: ${name}`);
    return newCategory;
  } catch (error) {
    console.error('Error adding category:', error);
    toast.error('Failed to add category');
    return null;
  }
};

export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    // First delete all items in this category
    const items = getLocalStorage<GroceryItem>('items');
    const filteredItems = items.filter(item => item.category_id !== categoryId);
    setLocalStorage('items', filteredItems);
    
    // Then delete the category
    const categories = getLocalStorage<Category>('categories');
    const filteredCategories = categories.filter(cat => cat.id !== categoryId);
    setLocalStorage('categories', filteredCategories);
    
    toast.success('Category deleted');
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    toast.error('Failed to delete category');
    return false;
  }
};

// Items
export const fetchItems = async (categoryId: string): Promise<GroceryItem[]> => {
  try {
    const items = getLocalStorage<GroceryItem>('items');
    return items.filter(item => item.category_id === categoryId);
  } catch (error) {
    console.error('Error fetching items:', error);
    toast.error('Failed to load items');
    return [];
  }
};

export const addItem = async (name: string, categoryId: string): Promise<GroceryItem | null> => {
  try {
    const items = getLocalStorage<GroceryItem>('items');
    const newItem = {
      id: uuidv4(),
      name,
      category_id: categoryId,
      quantity: 1,
      created_at: new Date().toISOString(),
    };
    
    items.push(newItem);
    setLocalStorage('items', items);
    
    toast.success(`Added item: ${name}`);
    return newItem;
  } catch (error) {
    console.error('Error adding item:', error);
    toast.error('Failed to add item');
    return null;
  }
};

export const updateItemQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
  try {
    const items = getLocalStorage<GroceryItem>('items');
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    
    setLocalStorage('items', updatedItems);
    return true;
  } catch (error) {
    console.error('Error updating item quantity:', error);
    toast.error('Failed to update quantity');
    return false;
  }
};

export const deleteItem = async (itemId: string): Promise<boolean> => {
  try {
    const items = getLocalStorage<GroceryItem>('items');
    const filteredItems = items.filter(item => item.id !== itemId);
    setLocalStorage('items', filteredItems);
    
    toast.success('Item deleted');
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    toast.error('Failed to delete item');
    return false;
  }
};

// Upload image - now just returns the image URL or a placeholder
export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    // Just return a placeholder URL since we can't actually upload
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Error handling image:', error);
    toast.error('Failed to process image');
    return null;
  }
};

// Voice command processing
export const processVoiceCommand = async (command: string): Promise<boolean> => {
  try {
    // Simple command processing logic
    const lowerCommand = command.toLowerCase();
    
    // Add item to a category
    const addMatch = lowerCommand.match(/add\s+(.*?)\s+to\s+(.*)/i);
    if (addMatch) {
      const itemName = addMatch[1].trim();
      const categoryName = addMatch[2].trim();
      
      // Find category by name
      const categories = getLocalStorage<Category>('categories');
      const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      
      if (category) {
        await addItem(itemName, category.id);
        toast.success(`Added ${itemName} to ${categoryName}`);
        return true;
      } else {
        toast.error(`Category "${categoryName}" not found`);
      }
    }
    
    // Create new category
    const createMatch = lowerCommand.match(/create\s+category\s+(.*)/i);
    if (createMatch) {
      const categoryName = createMatch[1].trim();
      await addCategory(categoryName, '');
      toast.success(`Created category: ${categoryName}`);
      return true;
    }
    
    // Increase quantity
    const increaseMatch = lowerCommand.match(/increase\s+(.*)\s+(?:by\s+(\d+))?/i);
    if (increaseMatch) {
      const itemName = increaseMatch[1].trim();
      const amount = increaseMatch[2] ? parseInt(increaseMatch[2]) : 1;
      
      // Find item by name
      const items = getLocalStorage<GroceryItem>('items');
      const item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      
      if (item) {
        const newQuantity = item.quantity + amount;
        await updateItemQuantity(item.id, newQuantity);
        toast.success(`Increased ${itemName} quantity to ${newQuantity}`);
        return true;
      } else {
        toast.error(`Item "${itemName}" not found`);
      }
    }
    
    // Decrease quantity
    const decreaseMatch = lowerCommand.match(/decrease\s+(.*)\s+(?:by\s+(\d+))?/i);
    if (decreaseMatch) {
      const itemName = decreaseMatch[1].trim();
      const amount = decreaseMatch[2] ? parseInt(decreaseMatch[2]) : 1;
      
      // Find item by name
      const items = getLocalStorage<GroceryItem>('items');
      const item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      
      if (item) {
        const newQuantity = Math.max(0, item.quantity - amount);
        await updateItemQuantity(item.id, newQuantity);
        toast.success(`Decreased ${itemName} quantity to ${newQuantity}`);
        return true;
      } else {
        toast.error(`Item "${itemName}" not found`);
      }
    }
    
    toast.info('I didn\'t understand that command');
    return false;
  } catch (error) {
    console.error('Error processing voice command:', error);
    toast.error('Failed to process voice command');
    return false;
  }
};
