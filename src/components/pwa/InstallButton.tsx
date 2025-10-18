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

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // No prompt available, show instructions instead
      setShowInstructions(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setIsInstalled(true);
        localStorage.setItem("pwa-installed", "true");
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error installing PWA:", error);
      setShowInstructions(true);
    }
  };

  const handleInfoClick = () => {
    setShowInstructions(true);
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        <Button
          onClick={handleInfoClick}
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg border-2 animate-pulse"
          aria-label="Ver instruções de instalação"
        >
          <Info className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={handleInstallClick}
          size="lg"
          className="rounded-full shadow-lg gap-2 pr-6"
          aria-label="Instalar aplicativo"
        >
          <Download className="h-5 w-5 animate-bounce" />
          <span className="hidden sm:inline">Instalar App</span>
        </Button>
      </div>

      <InstallInstructions 
        open={showInstructions} 
        onOpenChange={setShowInstructions}
      />
    </>
  );
};
