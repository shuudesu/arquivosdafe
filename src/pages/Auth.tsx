import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const signUpSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(100, "Senha muito longa")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter maiúsculas, minúsculas e números"
    ),
  fullName: z.string().trim().min(2, "Nome muito curto").max(100, "Nome muito longo"),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isLogin, setIsLogin] = useState(!token);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(!!token);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (token) {
      validateInviteToken(token);
    }
  }, [token]);

  const validateInviteToken = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc("validate_invite_token", {
        _token: token,
      });

      if (error || !data) {
        toast.error("Link de convite inválido ou expirado");
        navigate("/auth");
      }
    } catch (error) {
      toast.error("Erro ao validar link de convite");
      navigate("/auth");
    } finally {
      setValidatingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Validate login inputs
        const validatedData = loginSchema.parse({ email, password });

        const { error } = await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password,
        });

        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        navigate("/");
      } else {
        if (!token) {
          toast.error("Link de convite necessário para cadastro");
          return;
        }

        // Validate signup inputs
        const validatedData = signUpSchema.parse({ email, password, fullName });

        const redirectUrl = `${window.location.origin}/`;
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: validatedData.fullName,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: markError } = await supabase.rpc("mark_invite_used", {
            _token: token,
            _user_id: authData.user.id,
          });

          if (markError) {
            // Error marking invite as used - non-critical, user account still created
          }

          toast.success("Cadastro realizado com sucesso!");
          navigate("/");
        }
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Erro ao processar");
      }
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <p>Validando convite...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? "Entrar" : "Criar Conta"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Entre com suas credenciais"
              : "Cadastre-se usando o link de convite"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>
          {!token && (
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin
                  ? "Tem um link de convite? Cadastre-se"
                  : "Já tem uma conta? Entre"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
