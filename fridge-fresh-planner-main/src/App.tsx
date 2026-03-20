import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index.tsx";
import Recipes from "./pages/Recipes.tsx";
import ShoppingList from "./pages/ShoppingList.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Settings from "./pages/Settings.tsx";
import { ThemeProvider } from "./components/ThemeProvider";


// Внутри App() оберни TooltipProvider:
const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="fridge-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* ... остальной код ... */}
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="fridge-theme">
    <QueryClientProvider client={queryClient}>
      </TooltipProvider>
        const [session, setSession] = useState<any>(null);
        const [loading, setLoading] = useState(true);
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>

  useEffect(() => {
    // Проверяем текущую сессию при загрузке
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Подписываемся на изменения состояния (вход/выход)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // Или экран загрузки

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Если сессии нет, показываем Auth, иначе редирект на главную */}
            <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
            <Route path="/settings" element={session ? <Settings /> : <Navigate to="/auth" />} />
            {/* Защищенные роуты */}
            <Route path="/" element={session ? <Index /> : <Navigate to="/auth" />} />
            <Route path="/recipes" element={session ? <Recipes /> : <Navigate to="/auth" />} />
            <Route path="/shopping" element={session ? <ShoppingList /> : <Navigate to="/auth" />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;