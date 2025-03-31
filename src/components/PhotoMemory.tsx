
import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Memory } from '@/types/memory';
import { ImagePlus } from 'lucide-react';

interface PhotoMemoryProps {
  memory: Memory;
  onChange: (content: string) => void;
}

// Custom hook for handling file uploads
const useImageUpload = (initialImage: string = '', onImageChange: (dataUrl: string) => void) => {
  const [imagePreview, setImagePreview] = useState<string>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        onImageChange(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return { imagePreview, fileInputRef, handleFileChange, triggerFileInput };
};

const PhotoMemory: React.FC<PhotoMemoryProps> = ({ memory, onChange }) => {
  const [caption, setCaption] = useState<string>('');
  const { imagePreview, fileInputRef, handleFileChange, triggerFileInput } = 
    useImageUpload(memory.content, onChange);
  
  // Parse the memory content if needed
  React.useEffect(() => {
    if (memory.content) {
      try {
        // If needed, we can parse more data from content JSON here
        setCaption('');
      } catch (e) {
        setCaption('');
      }
    }
  }, [memory.content]);
  
  return (
    <Card className="overflow-hidden">
      <div 
        className={`relative flex items-center justify-center ${
          imagePreview ? 'bg-black' : 'bg-muted'
        } cursor-pointer min-h-[200px]`}
        onClick={triggerFileInput}
      >
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Memory" 
            className="max-w-full object-contain max-h-[400px]" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <ImagePlus size={48} strokeWidth={1} />
            <p className="mt-2">Click to upload a photo</p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <Textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Add a caption..."
        className="border-t"
      />
    </Card>
  );
};

export default PhotoMemory;
