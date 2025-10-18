import { Download, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookCardProps {
  id: string;
  title: string;
  author?: string;
  description?: string;
  filePath: string;
  coverUrl?: string;
}

export const BookCard = ({ id, title, author, description, filePath, coverUrl }: BookCardProps) => {
  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("pdfs")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Download iniciado!");
    } catch (error) {
      toast.error("Erro ao baixar o arquivo");
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-elegant group">
      <div className="aspect-[3/4] overflow-hidden bg-gradient-card">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <FileText className="h-20 w-20 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        {author && (
          <CardDescription className="text-sm">{author}</CardDescription>
        )}
      </CardHeader>
      {description && (
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
      )}
      <CardContent className="pt-0">
        <Button onClick={handleDownload} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </CardContent>
    </Card>
  );
};
