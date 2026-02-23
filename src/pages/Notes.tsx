import { useState, useEffect } from "react";
import { ArrowLeft, StickyNote, Trash2, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NoteCardSkeleton } from "@/components/SkeletonLoader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Note {
  id: string;
  title: string;
  content: string;
  note_type: string;
  created_at: string;
  updated_at: string;
}

const Notes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  const loadNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  const handleCreateNote = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: 'Untitled Note',
          content: '',
          note_type: 'manual',
        })
        .select()
        .single();

      if (error) throw error;
      setNotes(prev => [data, ...prev]);
      setSelectedNote(data);
      setEditMode(true);
      setEditedTitle(data.title);
      setEditedContent(data.content);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: editedTitle,
          content: editedContent,
        })
        .eq('id', selectedNote.id);

      if (error) throw error;

      setNotes(prev => prev.map(n => 
        n.id === selectedNote.id 
          ? { ...n, title: editedTitle, content: editedContent }
          : n
      ));
      
      setEditMode(false);
      toast.success('Note saved');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== id));
      setSelectedNote(null);
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'auto-summary': return 'Auto Summary';
      case 'document-summary': return 'Document';
      default: return 'Manual';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Notes</h1>
        </div>
        <Button onClick={handleCreateNote} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <NoteCardSkeleton key={i} />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <Card className="p-8 text-center">
              <StickyNote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No notes yet</p>
              <Button onClick={handleCreateNote} variant="outline" size="sm" className="mt-4">
                Create your first note
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium line-clamp-1">{note.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getNoteTypeLabel(note.note_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content || 'Empty note'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(note.created_at)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedNote} onOpenChange={() => {
        setSelectedNote(null);
        setEditMode(false);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Edit Note' : selectedNote?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-auto">
            {editMode ? (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={12}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getNoteTypeLabel(selectedNote?.note_type || '')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedNote && formatDate(selectedNote.created_at)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{selectedNote?.content}</p>
              </>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedNote && handleDeleteNote(selectedNote.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNote}>
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditMode(true);
                    setEditedTitle(selectedNote?.title || '');
                    setEditedContent(selectedNote?.content || '');
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;