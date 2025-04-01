
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
