import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Book {
  id: string;
  title: string;
  author: string | null;
  file_path: string;
}

export default function Reader() {
  const { bookId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && bookId) {
      loadBook();
    }
  }, [user, bookId]);

  const loadBook = async () => {
    try {
      setLoading(true);

      // Get book data
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (bookError) throw bookError;
      setBook(bookData);

      // Check rate limit
      const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc(
        "check_download_rate_limit",
        {
          _user_id: user!.id,
          _book_id: bookId,
        }
      );

      if (rateLimitError) throw rateLimitError;

      if (!rateLimitOk) {
        toast.error("Limite de visualizações atingido. Tente novamente mais tarde.");
        navigate("/");
        return;
      }

      // Get signed URL for PDF
      const { data: urlData, error: urlError } = await supabase.storage
        .from("pdfs")
        .createSignedUrl(bookData.file_path, 3600); // 1 hour

      if (urlError) throw urlError;
      setPdfUrl(urlData.signedUrl);
    } catch (error: any) {
      toast.error("Erro ao carregar livro");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!book || !user) return;

    try {
      const { data, error } = await supabase.storage
        .from("pdfs")
        .download(book.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download iniciado!");
    } catch (error: any) {
      toast.error("Erro ao fazer download");
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{book?.title}</h1>
              {book?.author && (
                <p className="text-sm text-muted-foreground">{book.author}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="icon" onClick={() => setScale(Math.min(2.0, scale + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="border rounded-lg bg-white shadow-sm overflow-auto max-h-[calc(100vh-200px)]">
            {pdfUrl && (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="p-8">Carregando PDF...</div>}
                error={<div className="p-8 text-destructive">Erro ao carregar PDF</div>}
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[100px] text-center">
              Página {pageNumber} de {numPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
