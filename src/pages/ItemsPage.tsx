
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PlusCircle, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import { Card } from "@/components/ui/card";

import BackButton from "@/components/BackButton";
import PageTitle from "@/components/PageTitle";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useGrocery } from "@/context/GroceryContext";

const ItemsPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  
  const { 
    categories, 
    items, 
    loadingItems, 
    refreshItems, 
    createItem, 
    removeItem, 
    updateQuantity,
    handleVoiceCommand
  } = useGrocery();
  
  const { toast } = useToast();
  
  // Find current category
  const currentCategory = categories.find(cat => cat.id === categoryId);
  const categoryItems = categoryId ? (items[categoryId] || []) : [];
  
  useEffect(() => {
    if (categoryId) {
      refreshItems(categoryId);
    }
  }, [categoryId, refreshItems]);

  const handleCreateItem = async () => {
    if (!categoryId) return;
    
    if (newItemName.trim() === "") {
      toast({ title: "Error", description: "Item name cannot be empty", variant: "destructive" });
      return;
    }
    
    try {
      await createItem(newItemName, categoryId);
      setNewItemName("");
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating item:", error);
      toast({ title: "Error", description: "Failed to create item", variant: "destructive" });
    }
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      await removeItem(itemToDelete);
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleChangeQuantity = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    await updateQuantity(itemId, newQuantity);
  };
  
  const getCategorySpecificItemLabel = (categoryName?: string) => {
    if (!categoryName) return "Item";
    
    const lowerCaseName = categoryName.toLowerCase();
    
    if (lowerCaseName === "fruits") return "Fruit";
    if (lowerCaseName === "veg" || lowerCaseName === "vegetables") return "Vegetable";
    if (lowerCaseName === "poultry") return "Meat";
    if (lowerCaseName === "condiments") return "Condiment";
    
    return "Item"; // Default fallback
  };

  const itemLabel = getCategorySpecificItemLabel(currentCategory?.name);

  return (
    <div className="page-container pb-20">
      <BackButton />
      
      <PageTitle 
        title={currentCategory?.name || "Items"} 
        subtitle={`Manage your ${currentCategory?.name?.toLowerCase() || "grocery"} items`} 
      />
      
      <div className="mt-4 space-y-4">
        <Button 
          variant="outline" 
          className="w-full border-grocery-primary text-grocery-primary flex justify-center items-center py-6"
          onClick={() => setCreateDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New {itemLabel}
        </Button>
        
        {loadingItems ? (
          <div className="text-center py-8">Loading items...</div>
        ) : categoryItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {itemLabel.toLowerCase()}s found. Add some {itemLabel.toLowerCase()}s to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {categoryItems.map(item => (
              <Card key={item.id} className="p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{item.name}</h3>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleChangeQuantity(item.id, item.quantity, -1)}
                      disabled={item.quantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="inline-flex items-center justify-center w-10">
                      {item.quantity}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleChangeQuantity(item.id, item.quantity, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500"
                      onClick={() => {
                        setItemToDelete(item.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {itemLabel}</DialogTitle>
            <DialogDescription>
              Enter the name of the {itemLabel.toLowerCase()} you want to add to this category.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{itemLabel} Name</Label>
              <Input 
                id="name" 
                value={newItemName} 
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`e.g., ${currentCategory?.name === "Fruits" ? "Apples" : 
                  currentCategory?.name === "Veg" ? "Carrots" : 
                  currentCategory?.name === "Poultry" ? "Chicken" : 
                  currentCategory?.name === "Condiments" ? "Salt" : "Item Name"}`}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNewItemName("");
                setCreateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateItem}>
              Add {itemLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemLabel}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {itemLabel.toLowerCase()}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <VoiceAssistant onVoiceCommand={handleVoiceCommand} />
    </div>
  );
};

export default ItemsPage;
