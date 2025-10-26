import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { InstallButton } from "./components/pwa/InstallButton";
import { FloatingChatButton } from "./components/chat/FloatingChatButton";
import Library from "./pages/Library";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Reader from "./pages/Reader";
import ChatBiblico from "./pages/ChatBiblico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reader/:bookId" element={<Reader />} />
            <Route path="/chat-biblico" element={<ChatBiblico />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingChatButton />
          <InstallButton />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
