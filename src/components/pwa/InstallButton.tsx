import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InstallInstructions } from "./InstallInstructions";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const installed = localStorage.getItem("pwa-installed");
    if (installed === "true") {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      localStorage.setItem("pwa-installed", "true");
      toast({
        title: "App instalado com sucesso! ✨",
        description: "Você pode acessar sua biblioteca diretamente da tela inicial.",
      });
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [toast]);

  const handleInstallClick = () => {
    // Always show instructions first
    setShowInstructions(true);
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleInstallClick}
          size="lg"
          className="rounded-full shadow-lg gap-2 animate-pulse hover:animate-none px-6"
          aria-label="Faça o Download do APP"
        >
          <Download className="h-5 w-5" />
          <span>Faça o Download do APP</span>
        </Button>
      </div>

      <InstallInstructions 
        open={showInstructions} 
        onOpenChange={setShowInstructions}
        deferredPrompt={deferredPrompt}
        onInstallComplete={() => {
          setIsInstalled(true);
          setDeferredPrompt(null);
          toast({
            title: "App instalado com sucesso! ✨",
            description: "Você pode acessar sua biblioteca diretamente da tela inicial.",
          });
        }}
      />
    </>
  );
};
