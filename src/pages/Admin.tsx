import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/components/auth/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Link2, Upload } from "lucide-react";

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [inviteLink, setInviteLink] = useState("");
  const [inviteLinks, setInviteLinks] = useState<any[]>([]);
  
  // Book upload state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadInviteLinks();
    }
  }, [isAdmin]);

  const loadInviteLinks = async () => {
    const { data } = await supabase
      .from("invite_links")
      .select("*")
      .order("created_at", { ascending: false });
    
    setInviteLinks(data || []);
  };

  const generateInviteLink = async () => {
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const { error } = await supabase
        .from("invite_links")
        .insert({
          token,
          created_by: user!.id,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      const link = `${window.location.origin}/auth?token=${token}`;
      setInviteLink(link);
      loadInviteLinks();
      toast.success("Link de convite gerado!");
    } catch (error) {
      toast.error("Erro ao gerar link");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado!");
  };

  const handleUploadBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Selecione um arquivo PDF");
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${pdfFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("books")
        .insert({
          title,
          author: author || null,
          description: description || null,
          file_path: fileName,
          file_size: pdfFile.size,
          uploaded_by: user!.id,
        });

      if (insertError) throw insertError;

      toast.success("Livro adicionado com sucesso!");
      setTitle("");
      setAuthor("");
      setDescription("");
      setPdfFile(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || !user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Painel Admin</h1>

        <Tabs defaultValue="invites" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invites">Links de Convite</TabsTrigger>
            <TabsTrigger value="upload">Upload de Livros</TabsTrigger>
          </TabsList>

          <TabsContent value="invites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Link de Convite</CardTitle>
                <CardDescription>
                  Crie links criptografados para novos usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateInviteLink} className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Gerar Novo Link
                </Button>
                
                {inviteLink && (
                  <div className="space-y-2">
                    <Label>Link Gerado</Label>
                    <div className="flex gap-2">
                      <Input value={inviteLink} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(inviteLink)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Links Ativos</h3>
                  <div className="space-y-2">
                    {inviteLinks.filter(link => !link.used_at).map((link) => (
                      <div key={link.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <div className="flex-1 truncate text-sm">
                          {`${window.location.origin}/auth?token=${link.token}`}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${window.location.origin}/auth?token=${link.token}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload de Livro</CardTitle>
                <CardDescription>
                  Adicione novos livros à biblioteca
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadBook} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Autor</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pdf">Arquivo PDF *</Label>
                    <Input
                      id="pdf"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={uploading} className="gap-2">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Enviando..." : "Fazer Upload"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
