import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { X, Plus, Image, Save, Loader2 } from 'lucide-react';
import { Memory } from '@/types/memory';
import PhotoMemory from './PhotoMemory';

interface MemoryDetailProps {
  date: Date;
  memories: Memory[];
  onClose: () => void;
  onSave: (memories: Memory[]) => void;
  isLoading?: boolean;
}

const MemoryDetail: React.FC<MemoryDetailProps> = ({
  date,
  memories,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [editableMemories, setEditableMemories] = useState<Memory[]>(memories);
  
  // Update editable memories when props change
  React.useEffect(() => {
    setEditableMemories(memories);
  }, [memories]);
  
  const handleAddNote = () => {
    setEditableMemories([
      ...editableMemories,
      { id: `temp_${Date.now()}`, type: 'note', content: '', createdAt: new Date() }
    ]);
  };
  
  const handleAddPhoto = () => {
    setEditableMemories([
      ...editableMemories,
      { id: `temp_${Date.now()}`, type: 'photo', content: '', createdAt: new Date() }
    ]);
  };
  
  const handleMemoryChange = (id: string, content: string) => {
    setEditableMemories(
      editableMemories.map(memory => 
        memory.id === id ? { ...memory, content } : memory
      )
    );
  };
  
  const handleDeleteMemory = (id: string) => {
    setEditableMemories(editableMemories.filter(memory => memory.id !== id));
  };
  
  const handleSave = () => {
    // Filter out empty memories before saving
    const filteredMemories = editableMemories.filter(
      memory => memory.type === 'photo' || memory.content.trim() !== ''
    );
    onSave(filteredMemories);
  };
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up material-shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">
            {format(date, 'MMMM d, yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-primary mr-2" />
              <span>Loading memories...</span>
            </div>
          ) : editableMemories.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No memories for this day yet. Add a note or photo to get started.
            </div>
          ) : (
            editableMemories.map(memory => (
              <div key={memory.id} className="relative group">
                {memory.type === 'note' ? (
                  <Textarea
                    value={memory.content}
                    onChange={(e) => handleMemoryChange(memory.id, e.target.value)}
                    placeholder="Write your memory here..."
                    className="min-h-[100px] resize-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <PhotoMemory
                    memory={memory}
                    onChange={(content) => handleMemoryChange(memory.id, content)}
                  />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteMemory(memory.id)}
                >
                  <X size={14} />
                </Button>
              </div>
            ))
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddNote} disabled={isLoading}>
              <Plus size={16} className="mr-1" /> Note
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddPhoto} disabled={isLoading}>
              <Image size={16} className="mr-1" /> Photo
            </Button>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" /> Save Memories
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MemoryDetail;
