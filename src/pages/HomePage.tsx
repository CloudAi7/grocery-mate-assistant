
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PageTitle from "@/components/PageTitle";
import { useGrocery } from "@/context/GroceryContext";
import VoiceAssistant from "@/components/VoiceAssistant";
import { ShoppingCart, HelpCircle } from "lucide-react";

const HomePage = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  const navigate = useNavigate();
  const { handleVoiceCommand } = useGrocery();

  return (
    <div className="page-container items-center justify-center">
      <div className="animate-fade-in w-full max-w-sm mx-auto text-center">
        <div className="mb-6">
          <ShoppingCart size={80} className="mx-auto text-grocery-primary" />
        </div>
        
        <PageTitle 
          title="Fridge Grocery List" 
          subtitle="Keep track of your groceries with ease"
        />

        <div className="space-y-6">
          <Button 
            className="ios-button w-full text-lg py-5"
            onClick={() => navigate('/categories')}
          >
            Start
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-grocery-primary text-grocery-primary"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Try using voice commands to manage your grocery list!
        </p>
      </div>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How to Use Fridge Grocery List</DialogTitle>
            <DialogDescription>
              A simple guide to help you get started
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-medium text-grocery-primary">Categories</h3>
              <p className="text-sm">Create categories to organize your grocery items (e.g., Vegetables, Fruits).</p>
            </div>
            
            <div>
              <h3 className="font-medium text-grocery-primary">Items</h3>
              <p className="text-sm">Add items to categories and keep track of their quantities.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-grocery-primary">Voice Commands</h3>
              <p className="text-sm">Use the microphone icon to give voice commands like:</p>
              <ul className="list-disc list-inside text-sm pl-2 mt-1">
                <li>"Add milk to dairy"</li>
                <li>"Create category snacks"</li>
                <li>"Increase apples by 2"</li>
                <li>"Decrease bread"</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <VoiceAssistant onVoiceCommand={handleVoiceCommand} />
    </div>
  );
};

export default HomePage;
