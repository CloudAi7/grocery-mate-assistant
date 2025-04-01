
export interface Category {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}

export interface GroceryItem {
  id: string;
  category_id: string;
  name: string;
  quantity: number;
  created_at: string;
}
