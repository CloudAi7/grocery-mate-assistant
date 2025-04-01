
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GroceryProvider } from "./context/GroceryContext";
import { useEffect } from "react";
import { toast } from "sonner";

import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import ItemsPage from "./pages/ItemsPage";
import NotFound from "./pages/NotFound";
import { initializeDatabase } from "./services/supabaseClient";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error("Failed to initialize database:", error);
        toast.error("Failed to connect to database. Using offline mode.");
      }
    };
    
    setupDatabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <GroceryProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:categoryId" element={<ItemsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </GroceryProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
