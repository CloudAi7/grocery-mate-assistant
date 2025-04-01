
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

import BackButton from "@/components/BackButton";
import PageTitle from "@/components/PageTitle";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useGrocery } from "@/context/GroceryContext";
import { uploadImage } from "@/services/supabaseService";

const CategoriesPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { categories, loadingCategories, refreshCategories, createCategory, removeCategory, handleVoiceCommand } = useGrocery();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    refreshCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (newCategoryName.trim() === "") {
      toast({ title: "Error", description: "Category name cannot be empty", variant: "destructive" });
      return;
    }
    
    setIsUploading(true);
    try {
      let imageUrl = "";
      
      if (uploadedImage) {
        const url = await uploadImage(uploadedImage);
        if (url) imageUrl = url;
      }
      
      await createCategory(newCategoryName, imageUrl);
      setNewCategoryName("");
      setUploadedImage(null);
      setCreateDialogOpen(false);
      
      // Refresh categories after creating a new one
      refreshCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      await removeCategory(categoryToDelete);
      setCategoryToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
    }
  };

  // Default category images
  const defaultImages = {
    "Veg": "https://source.unsplash.com/random/300x200/?vegetables",
    "Poultry": "https://source.unsplash.com/random/300x200/?poultry",
    "Fruits": "https://source.unsplash.com/random/300x200/?fruits",
    "Condiments": "https://source.unsplash.com/random/300x200/?condiments"
  };
  
  // Add default categories if none exist
  useEffect(() => {
    const addDefaultCategories = async () => {
      if (categories.length === 0 && !loadingCategories) {
        for (const [name, imageUrl] of Object.entries(defaultImages)) {
          await createCategory(name, imageUrl);
        }
        // Refresh after adding default categories
        await refreshCategories();
      }
    };
    
    addDefaultCategories();
  }, [categories, loadingCategories]);

  const handleCategoryClick = (categoryId: string) => {
    try {
      navigate(`/category/${categoryId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast({ title: "Error", description: "Failed to navigate to category", variant: "destructive" });
    }
  };

  return (
    <div className="page-container">
      <BackButton />
      
      <PageTitle title="Categories" subtitle="Select a category or create a new one" />
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        {loadingCategories ? (
          <div className="col-span-2 text-center py-8">Loading categories...</div>
        ) : (
          <>
            {categories.map(category => (
              <div 
                key={category.id} 
                className="category-card relative"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div 
                  className="absolute top-2 right-2 z-10 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategoryToDelete(category.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </div>
                
                <div className="w-full h-32 mb-2 rounded-lg overflow-hidden">
                  <img 
                    src={category.image_url || "https://source.unsplash.com/random/300x200/?groceries"} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://source.unsplash.com/random/300x200/?groceries";
                    }}
                  />
                </div>
                
                <p className="font-medium text-center">{category.name}</p>
              </div>
            ))}
            
            <div 
              className="category-card flex flex-col items-center justify-center"
              onClick={() => setCreateDialogOpen(true)}
            >
              <PlusCircle className="h-10 w-10 text-grocery-primary mb-2" />
              <p className="font-medium text-center">Create a new category</p>
            </div>
          </>
        )}
      </div>
      
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Enter a name for your new category. Image upload is optional.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input 
                id="name" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Dairy Products"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Category Image (optional)</Label>
              <Input 
                id="image" 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploadedImage && (
                <div className="mt-2">
                  <p className="text-sm">Selected: {uploadedImage.name}</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNewCategoryName("");
                setUploadedImage(null);
                setCreateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCategory}
              disabled={isUploading}
            >
              {isUploading ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category and all its items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <VoiceAssistant onVoiceCommand={handleVoiceCommand} />
    </div>
  );
};

export default CategoriesPage;
