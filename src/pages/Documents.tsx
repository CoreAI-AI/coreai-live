import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Trash2, FileSearch, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DocumentUploader } from "@/components/DocumentUploader";
import { DocumentListSkeleton } from "@/components/SkeletonLoader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

const Documents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const handleSummarize = async (doc: Document) => {
    setSummarizing(doc.id);
    try {
      const { data, error } = await supabase.functions.invoke('document-summarize', {
        body: {
          documentUrl: doc.file_url,
          action: 'summarize',
          fileName: doc.file_name,
        },
      });

      if (error) throw error;
      toast.success('Summary created and saved to Notes');
      navigate('/notes');
    } catch (error) {
      console.error('Summarization error:', error);
      toast.error('Failed to summarize document');
    } finally {
      setSummarizing(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const doc = documents.find(d => d.id === deleteId);
      if (doc) {
        const filePath = doc.file_url.split('/').slice(-2).join('/');
        await supabase.storage.from('documents').remove([filePath]);
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      setDocuments(prev => prev.filter(d => d.id !== deleteId));
      toast.success('Document deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    } finally {
      setDeleteId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b border-border p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Documents</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Upload Document</h2>
            <DocumentUploader userId={user?.id || ''} onUploadComplete={loadDocuments} />
          </Card>

          <div>
            <h2 className="text-lg font-medium mb-4">Your Documents</h2>
            {loading ? (
              <DocumentListSkeleton />
            ) : documents.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-10 h-10 text-primary" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{doc.file_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSummarize(doc)}
                          disabled={summarizing === doc.id}
                        >
                          {summarizing === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileSearch className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The document will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documents;