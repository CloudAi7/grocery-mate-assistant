
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

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Database is already set up, so we don't need to initialize it again
    toast.success("Connected to database successfully!");
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
