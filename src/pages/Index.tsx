import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { BookOpen, UserPlus, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Lumen Books
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sua biblioteca digital de PDFs. Acesse, leia e gerencie seus livros de qualquer lugar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate("/library")}
                  className="gap-2 min-w-[200px]"
                >
                  <BookOpen className="h-5 w-5" />
                  Acessar Biblioteca
                </Button>
                {isAdmin && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/admin")}
                    className="gap-2 min-w-[200px]"
                  >
                    <Shield className="h-5 w-5" />
                    Painel Admin
                  </Button>
                )}
              </>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2 min-w-[200px]"
              >
                <UserPlus className="h-5 w-5" />
                Fazer Login
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Biblioteca Completa</h3>
              <p className="text-sm text-muted-foreground">
                Acesse todos os seus PDFs em um só lugar
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Seguro e Privado</h3>
              <p className="text-sm text-muted-foreground">
                Sistema de autenticação e controle de acesso
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Convites Exclusivos</h3>
              <p className="text-sm text-muted-foreground">
                Acesso controlado via links criptografados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
