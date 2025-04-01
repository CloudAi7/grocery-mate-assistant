
import { toast } from 'sonner';
import { Category, GroceryItem } from '@/types/groceryTypes';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

// Fallback to localStorage when Supabase operations fail
const getLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return [];
  }
};

const setLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      // Fallback to localStorage
      const localCategories = getLocalStorage('categories');
      console.log('Fetched categories from localStorage:', localCategories);
      return localCategories;
    }
    
    console.log('Fetched categories from Supabase:', data);
    // Update localStorage with latest data
    setLocalStorage('categories', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Failed to load categories');
    return getLocalStorage('categories');
  }
};

export const addCategory = async (name: string, imageUrl: string = ''): Promise<Category | null> => {
  try {
    const newCategory = {
      name,
      image_url: imageUrl,
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert(newCategory)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding category to Supabase:', error);
      // Fallback to localStorage
      const categories = getLocalStorage('categories');
      const localNewCategory = {
        id: uuidv4(),
        name,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      };
      categories.push(localNewCategory);
      setLocalStorage('categories', categories);
      toast.success(`Added category: ${name} (offline mode)`);
      return localNewCategory;
    }
    
    toast.success(`Added category: ${name}`);
    return data;
  } catch (error) {
    console.error('Error adding category:', error);
    toast.error('Failed to add category');
    return null;
  }
};

export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    // First delete all items in this category
    const { error: itemsError } = await supabase
      .from('items')
      .delete()
      .eq('category_id', categoryId);
    
    if (itemsError) {
      console.error('Error deleting items from Supabase:', itemsError);
      // Fallback to localStorage
      const items = getLocalStorage('items');
      const filteredItems = items.filter(item => item.category_id !== categoryId);
      setLocalStorage('items', filteredItems);
    }
    
    // Then delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    
    if (error) {
      console.error('Error deleting category from Supabase:', error);
      // Fallback to localStorage
      const categories = getLocalStorage('categories');
      const filteredCategories = categories.filter(cat => cat.id !== categoryId);
      setLocalStorage('categories', filteredCategories);
    }
    
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
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching items from Supabase:', error);
      // Fallback to localStorage
      const items = getLocalStorage('items');
      return items.filter(item => item.category_id === categoryId);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching items:', error);
    toast.error('Failed to load items');
    return [];
  }
};

export const addItem = async (name: string, categoryId: string): Promise<GroceryItem | null> => {
  try {
    // Fetch the category to determine if any special logic is needed
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .single();
    
    if (categoryError && categoryError.code !== 'PGRST116') {
      console.error('Error fetching category:', categoryError);
    }
    
    const newItem = {
      name,
      category_id: categoryId,
      quantity: 1, // Default quantity
    };
    
    // Apply category-specific logic for initial values if needed
    if (category) {
      const categoryName = category.name.toLowerCase();
      
      if (categoryName === 'fruits' || categoryName === 'veg' || categoryName === 'vegetables') {
        // For fruits and vegetables, perhaps we count in pounds/kg
        newItem.quantity = 1;
      } else if (categoryName === 'poultry') {
        // For poultry, maybe we count in pounds
        newItem.quantity = 1;
      }
      // Add more category-specific logic as needed
    }
    
    const { data, error } = await supabase
      .from('items')
      .insert(newItem)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding item to Supabase:', error);
      // Fallback to localStorage
      const items = getLocalStorage('items');
      const localNewItem = {
        id: uuidv4(),
        name,
        category_id: categoryId,
        quantity: newItem.quantity,
        created_at: new Date().toISOString()
      };
      items.push(localNewItem);
      setLocalStorage('items', items);
      toast.success(`Added item: ${name} (offline mode)`);
      return localNewItem;
    }
    
    toast.success(`Added item: ${name}`);
    return data;
  } catch (error) {
    console.error('Error adding item:', error);
    toast.error('Failed to add item');
    return null;
  }
};

export const updateItemQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('items')
      .update({ quantity })
      .eq('id', itemId);
    
    if (error) {
      console.error('Error updating item quantity in Supabase:', error);
      // Fallback to localStorage
      const items = getLocalStorage('items');
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      setLocalStorage('items', updatedItems);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating item quantity:', error);
    toast.error('Failed to update quantity');
    return false;
  }
};

export const deleteItem = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('Error deleting item from Supabase:', error);
      // Fallback to localStorage
      const items = getLocalStorage('items');
      const filteredItems = items.filter(item => item.id !== itemId);
      setLocalStorage('items', filteredItems);
    }
    
    toast.success('Item deleted');
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    toast.error('Failed to delete item');
    return false;
  }
};

// Upload image to Supabase storage
export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${uuidv4()}.${fileExt}`;
    
    const { data, error } = await supabase
      .storage
      .from('category-images')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading image to Supabase:', error);
      // Fallback to local URL
      return URL.createObjectURL(file);
    }
    
    const { data: urlData } = supabase
      .storage
      .from('category-images')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image');
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
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', categoryName);
      
      if (categoryError) {
        console.error('Error finding category:', categoryError);
        // Fallback to localStorage
        const localCategories = getLocalStorage('categories');
        const category = localCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        
        if (category) {
          await addItem(itemName, category.id);
          toast.success(`Added ${itemName} to ${categoryName}`);
          return true;
        } else {
          toast.error(`Category "${categoryName}" not found`);
          return false;
        }
      }
      
      const category = categories && categories[0];
      
      if (category) {
        await addItem(itemName, category.id);
        toast.success(`Added ${itemName} to ${categoryName}`);
        return true;
      } else {
        toast.error(`Category "${categoryName}" not found`);
        return false;
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
      const { data: items, error: itemError } = await supabase
        .from('items')
        .select('*')
        .ilike('name', itemName);
      
      if (itemError) {
        console.error('Error finding item:', itemError);
        // Fallback to localStorage
        const localItems = getLocalStorage('items');
        const item = localItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        
        if (item) {
          const newQuantity = item.quantity + amount;
          await updateItemQuantity(item.id, newQuantity);
          toast.success(`Increased ${itemName} quantity to ${newQuantity}`);
          return true;
        } else {
          toast.error(`Item "${itemName}" not found`);
          return false;
        }
      }
      
      const item = items && items[0];
      
      if (item) {
        const newQuantity = item.quantity + amount;
        await updateItemQuantity(item.id, newQuantity);
        toast.success(`Increased ${itemName} quantity to ${newQuantity}`);
        return true;
      } else {
        toast.error(`Item "${itemName}" not found`);
        return false;
      }
    }
    
    // Decrease quantity
    const decreaseMatch = lowerCommand.match(/decrease\s+(.*)\s+(?:by\s+(\d+))?/i);
    if (decreaseMatch) {
      const itemName = decreaseMatch[1].trim();
      const amount = decreaseMatch[2] ? parseInt(decreaseMatch[2]) : 1;
      
      // Find item by name
      const { data: items, error: itemError } = await supabase
        .from('items')
        .select('*')
        .ilike('name', itemName);
      
      if (itemError) {
        console.error('Error finding item:', itemError);
        // Fallback to localStorage
        const localItems = getLocalStorage('items');
        const item = localItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        
        if (item) {
          const newQuantity = Math.max(0, item.quantity - amount);
          await updateItemQuantity(item.id, newQuantity);
          toast.success(`Decreased ${itemName} quantity to ${newQuantity}`);
          return true;
        } else {
          toast.error(`Item "${itemName}" not found`);
          return false;
        }
      }
      
      const item = items && items[0];
      
      if (item) {
        const newQuantity = Math.max(0, item.quantity - amount);
        await updateItemQuantity(item.id, newQuantity);
        toast.success(`Decreased ${itemName} quantity to ${newQuantity}`);
        return true;
      } else {
        toast.error(`Item "${itemName}" not found`);
        return false;
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
