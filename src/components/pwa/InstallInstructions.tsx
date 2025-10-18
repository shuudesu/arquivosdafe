import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Monitor, Share2, MoreVertical, Download, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface InstallInstructionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Platform = "android" | "ios" | "desktop" | "unknown";

export const InstallInstructions = ({ open, onOpenChange }: InstallInstructionsProps) => {
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isDesktop = !isIOS && !isAndroid;

    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");
    else if (isDesktop) setPlatform("desktop");
  }, []);

  const renderAndroidInstructions = () => (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="h-8 w-8 text-primary" />
        <h3 className="text-xl font-semibold">Android - Chrome</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
          <p className="pt-1">Toque no botão <strong>"Instalar App"</strong> que aparece no canto inferior direito da tela</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
          <p className="pt-1">Ou toque no menu <MoreVertical className="inline h-4 w-4" /> (três pontos) no canto superior direito</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
          <p className="pt-1">Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar app"</strong></p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">4</div>
          <p className="pt-1">Confirme tocando em <strong>"Adicionar"</strong> ou <strong>"Instalar"</strong></p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          ✨ O ícone do app aparecerá na sua tela inicial e você poderá abrir como qualquer outro aplicativo!
        </p>
      </div>
    </Card>
  );

  const renderIOSInstructions = () => (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="h-8 w-8 text-primary" />
        <h3 className="text-xl font-semibold">iPhone/iPad - Safari</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
          <p className="pt-1">Toque no botão <Share2 className="inline h-4 w-4" /> <strong>"Compartilhar"</strong> na parte inferior da tela</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
          <p className="pt-1">Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
          <p className="pt-1">Edite o nome do app se desejar</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">4</div>
          <p className="pt-1">Toque em <strong>"Adicionar"</strong> no canto superior direito</p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          ⚠️ <strong>Importante:</strong> No iPhone/iPad, você DEVE usar o navegador Safari. O Chrome não permite adicionar apps à tela inicial no iOS.
        </p>
      </div>
      
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          ✨ O ícone do app aparecerá na sua tela inicial junto com seus outros apps!
        </p>
      </div>
    </Card>
  );

  const renderDesktopInstructions = () => (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Monitor className="h-8 w-8 text-primary" />
        <h3 className="text-xl font-semibold">Desktop - Chrome/Edge</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
          <p className="pt-1">Clique no botão <strong>"Instalar App"</strong> que aparece no canto inferior direito</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
          <p className="pt-1">Ou clique no ícone <Download className="inline h-4 w-4" /> de instalação na barra de endereço</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
          <p className="pt-1">Confirme clicando em <strong>"Instalar"</strong></p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          ✨ O app será adicionado à sua área de trabalho e barra de tarefas. Você poderá abrir em uma janela separada!
        </p>
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Adicionar à Tela Inicial</DialogTitle>
          <DialogDescription>
            Instale o app e acesse rapidamente sua biblioteca de qualquer lugar, mesmo offline!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {platform === "android" && renderAndroidInstructions()}
          {platform === "ios" && renderIOSInstructions()}
          {platform === "desktop" && renderDesktopInstructions()}
          
          {platform === "unknown" && (
            <>
              {renderAndroidInstructions()}
              {renderIOSInstructions()}
              {renderDesktopInstructions()}
            </>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
