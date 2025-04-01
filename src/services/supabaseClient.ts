
import { createClient } from '@supabase/supabase-js';
import { Category, GroceryItem } from '@/types/groceryTypes';

const supabaseUrl = 'https://wxwlhycyxdlneumdjdgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4d2xoeWN5eGRsbmV1bWRqZGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTQxNzcsImV4cCI6MjA1OTA3MDE3N30.onLwz7cLFC6XN20Npx9-fuk7P4LH8rOfsskjTg6qX4U';

export const supabase = createClient<{
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      items: {
        Row: GroceryItem;
        Insert: Omit<GroceryItem, 'id' | 'created_at'>;
        Update: Partial<Omit<GroceryItem, 'id' | 'created_at'>>;
      };
    };
  };
}>(supabaseUrl, supabaseKey);

// Initialize database tables
export const initializeDatabase = async () => {
  console.log("Initializing database tables...");
  
  // Check if categories table exists
  const { error: categoriesError } = await supabase
    .from('categories')
    .select('count')
    .limit(1)
    .single();
  
  if (categoriesError && categoriesError.code === '42P01') {
    console.log("Creating categories table...");
    // Create categories table
    const { error } = await supabase.rpc('create_categories_table');
    if (error) {
      console.error("Error creating categories table:", error);
      
      // If RPC fails, try executing SQL directly
      await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            image_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `
      });
    }
  }
  
  // Check if items table exists
  const { error: itemsError } = await supabase
    .from('items')
    .select('count')
    .limit(1)
    .single();
  
  if (itemsError && itemsError.code === '42P01') {
    console.log("Creating items table...");
    // Create items table
    const { error } = await supabase.rpc('create_items_table');
    if (error) {
      console.error("Error creating items table:", error);
      
      // If RPC fails, try executing SQL directly
      await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `
      });
    }
  }
  
  console.log("Database initialization completed");
};
