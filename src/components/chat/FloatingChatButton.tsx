import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export const FloatingChatButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Button
      onClick={() => navigate("/chat-biblico")}
      className="fixed bottom-8 left-8 z-50 h-14 gap-2 px-6 shadow-elegant hover:shadow-glow animate-fade-in"
      size="lg"
    >
      <Sparkles className="h-5 w-5" />
      <span className="font-semibold">Chat Bíblico IA</span>
    </Button>
  );
};
