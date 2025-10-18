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
import { Copy, Link2, Upload, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const bookUploadSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  author: z.string().trim().max(100, "Nome do autor muito longo").optional(),
  description: z.string().trim().max(2000, "Descrição muito longa").optional(),
});

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface Book {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  file_path: string;
  cover_url: string | null;
}

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [inviteLink, setInviteLink] = useState("");
  const [inviteLinks, setInviteLinks] = useState<any[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadInviteLinks();
      loadBooks();
    }
  }, [user, isAdmin]);

  const loadInviteLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("invite_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInviteLinks(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar links de convite");
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar livros");
    }
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

    // Validate file type and size
    if (pdfFile.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são permitidos");
      return;
    }

    if (pdfFile.size > MAX_PDF_SIZE) {
      toast.error("Arquivo PDF muito grande (máximo 50MB)");
      return;
    }

    setUploading(true);
    
    try {
      // Validate book metadata
      const validatedData = bookUploadSchema.parse({
        title,
        author: author || undefined,
        description: description || undefined,
      });

      // Use UUID-based filename for security
      const fileExtension = pdfFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExtension}`;
      
      // Upload cover image if provided
      let coverUrl = null;
      if (coverFile) {
        if (coverFile.type !== "image/jpeg" && coverFile.type !== "image/png" && coverFile.type !== "image/webp") {
          toast.error("Apenas imagens JPG, PNG ou WEBP são permitidas");
          setUploading(false);
          return;
        }

        if (coverFile.size > MAX_IMAGE_SIZE) {
          toast.error("Imagem muito grande (máximo 5MB)");
          setUploading(false);
          return;
        }

        const coverExtension = coverFile.name.split(".").pop();
        const coverFileName = `${crypto.randomUUID()}.${coverExtension}`;
        
        const { error: coverUploadError } = await supabase.storage
          .from("covers")
          .upload(coverFileName, coverFile);

        if (coverUploadError) throw coverUploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("covers")
          .getPublicUrl(coverFileName);

        coverUrl = publicUrl;
      }
      
      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("books")
        .insert({
          title: validatedData.title,
          author: validatedData.author || null,
          description: validatedData.description || null,
          file_path: fileName,
          cover_url: coverUrl,
          file_size: pdfFile.size,
          uploaded_by: user!.id,
        });

      if (insertError) throw insertError;

      toast.success("Livro enviado com sucesso!");
      setTitle("");
      setAuthor("");
      setDescription("");
      setPdfFile(null);
      setCoverFile(null);
      loadBooks();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao fazer upload");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    setUploading(true);
    try {
      const validatedData = bookUploadSchema.parse({
        title,
        author: author || undefined,
        description: description || undefined,
      });

      let coverUrl = editingBook.cover_url;

      // Upload new cover if provided
      if (coverFile) {
        if (coverFile.type !== "image/jpeg" && coverFile.type !== "image/png" && coverFile.type !== "image/webp") {
          toast.error("Apenas imagens JPG, PNG ou WEBP são permitidas");
          setUploading(false);
          return;
        }

        if (coverFile.size > MAX_IMAGE_SIZE) {
          toast.error("Imagem muito grande (máximo 5MB)");
          setUploading(false);
          return;
        }

        // Delete old cover if exists
        if (editingBook.cover_url) {
          const oldCoverPath = editingBook.cover_url.split("/").pop();
          if (oldCoverPath) {
            await supabase.storage.from("covers").remove([oldCoverPath]);
          }
        }

        const coverExtension = coverFile.name.split(".").pop();
        const coverFileName = `${crypto.randomUUID()}.${coverExtension}`;
        
        const { error: coverUploadError } = await supabase.storage
          .from("covers")
          .upload(coverFileName, coverFile);

        if (coverUploadError) throw coverUploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("covers")
          .getPublicUrl(coverFileName);

        coverUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("books")
        .update({
          title: validatedData.title,
          author: validatedData.author || null,
          description: validatedData.description || null,
          cover_url: coverUrl,
        })
        .eq("id", editingBook.id);

      if (updateError) throw updateError;

      toast.success("Livro atualizado com sucesso!");
      setEditingBook(null);
      setTitle("");
      setAuthor("");
      setDescription("");
      setCoverFile(null);
      loadBooks();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao atualizar livro");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!deletingBookId) return;

    try {
      const book = books.find(b => b.id === deletingBookId);
      if (!book) return;

      // Delete PDF file
      const { error: pdfDeleteError } = await supabase.storage
        .from("pdfs")
        .remove([book.file_path]);

      if (pdfDeleteError) throw pdfDeleteError;

      // Delete cover if exists
      if (book.cover_url) {
        const coverPath = book.cover_url.split("/").pop();
        if (coverPath) {
          await supabase.storage.from("covers").remove([coverPath]);
        }
      }

      // Delete database record
      const { error: deleteError } = await supabase
        .from("books")
        .delete()
        .eq("id", deletingBookId);

      if (deleteError) throw deleteError;

      toast.success("Livro excluído com sucesso!");
      setDeletingBookId(null);
      loadBooks();
    } catch (error: any) {
      toast.error("Erro ao excluir livro");
    }
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author || "");
    setDescription(book.description || "");
    setCoverFile(null);
  };

  if (authLoading || !user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Painel Admin</h1>

        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">Upload de Livros</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Livros</TabsTrigger>
            <TabsTrigger value="invites">Links de Convite</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="cover">Imagem de Capa (opcional)</Label>
                    <Input
                      id="cover"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG ou WEBP - Máximo 5MB
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={uploading} className="gap-2">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Enviando..." : "Fazer Upload"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Livros na Biblioteca</CardTitle>
                <CardDescription>
                  Edite ou exclua livros existentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {books.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum livro cadastrado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {books.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {book.cover_url ? (
                            <img
                              src={book.cover_url}
                              alt={book.title}
                              className="w-16 h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{book.title}</h3>
                            {book.author && (
                              <p className="text-sm text-muted-foreground">
                                {book.author}
                              </p>
                            )}
                            {book.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {book.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(book)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingBookId(book.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
        </Tabs>
      </div>

      {/* Edit Book Dialog */}
      <Dialog open={!!editingBook} onOpenChange={() => {
        setEditingBook(null);
        setTitle("");
        setAuthor("");
        setDescription("");
        setCoverFile(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Livro</DialogTitle>
            <DialogDescription>
              Atualize as informações do livro
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBook} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-author">Autor</Label>
              <Input
                id="edit-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cover">Nova Imagem de Capa (opcional)</Label>
              {editingBook?.cover_url && (
                <div className="mb-2">
                  <img
                    src={editingBook.cover_url}
                    alt="Capa atual"
                    className="w-24 h-32 object-cover rounded"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Capa atual</p>
                </div>
              )}
              <Input
                id="edit-cover"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou WEBP - Máximo 5MB
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingBook(null);
                  setTitle("");
                  setAuthor("");
                  setDescription("");
                  setCoverFile(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBookId} onOpenChange={() => setDeletingBookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.
              O arquivo PDF e a imagem de capa também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBook} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
