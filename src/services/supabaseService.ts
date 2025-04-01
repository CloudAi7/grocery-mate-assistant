
import { createClient } from '@supabase/supabase-js';
import { Category, GroceryItem } from '@/types/groceryTypes';
import { toast } from 'sonner';

// Initialize Supabase client
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Failed to load categories');
    return [];
  }
};

export const addCategory = async (name: string, imageUrl: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, image_url: imageUrl }])
      .select()
      .single();
    
    if (error) throw error;
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
    await supabase
      .from('items')
      .delete()
      .match({ category_id: categoryId });
      
    // Then delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .match({ id: categoryId });
    
    if (error) throw error;
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
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching items:', error);
    toast.error('Failed to load items');
    return [];
  }
};

export const addItem = async (name: string, categoryId: string): Promise<GroceryItem | null> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .insert([{ name, category_id: categoryId, quantity: 1 }])
      .select()
      .single();
    
    if (error) throw error;
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
      .match({ id: itemId });
    
    if (error) throw error;
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
      .match({ id: itemId });
    
    if (error) throw error;
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
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `category-images/${fileName}`;
    
    const { error: uploadError } = await supabase
      .storage
      .from('grocery-images')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    const { data } = supabase
      .storage
      .from('grocery-images')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image');
    return null;
  }
};

// Voice command processing
export const processVoiceCommand = async (command: string): Promise<boolean> => {
  try {
    // Simple command processing logic - could be enhanced with a more sophisticated NLP approach
    const lowerCommand = command.toLowerCase();
    
    // Add item to a category
    const addMatch = lowerCommand.match(/add\s+(.*?)\s+to\s+(.*)/i);
    if (addMatch) {
      const itemName = addMatch[1].trim();
      const categoryName = addMatch[2].trim();
      
      // Find category by name
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', categoryName)
        .limit(1);
      
      if (categories && categories.length > 0) {
        await addItem(itemName, categories[0].id);
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
      const { data: items } = await supabase
        .from('items')
        .select('id, quantity')
        .ilike('name', itemName)
        .limit(1);
      
      if (items && items.length > 0) {
        const newQuantity = items[0].quantity + amount;
        await updateItemQuantity(items[0].id, newQuantity);
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
      const { data: items } = await supabase
        .from('items')
        .select('id, quantity')
        .ilike('name', itemName)
        .limit(1);
      
      if (items && items.length > 0) {
        const newQuantity = Math.max(0, items[0].quantity - amount);
        await updateItemQuantity(items[0].id, newQuantity);
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
