'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { readFileAsText } from '@/lib/textParser';

interface DropZoneProps {
  onTextReady: (text: string, fileName: string) => void;
}

export function DropZone({ onTextReady }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const text = await readFileAsText(file);
      setFileName(file.name);
      onTextReady(text, file.name.replace(/\.[^/.]+$/, ''));
    },
    [onTextReady]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      id="dropzone"
      aria-label="Upload file drop zone"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200',
        isDragging
          ? 'border-primary bg-primary/10 scale-[1.01]'
          : fileName
            ? 'border-primary/40 bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="*/*"
        onChange={onInputChange}
        id="file-input"
        aria-label="File input"
      />

      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-2xl transition-colors',
          fileName ? 'bg-primary/15' : 'bg-muted'
        )}
      >
        {fileName ? (
          <FileText className="h-8 w-8 text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      {fileName ? (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">{fileName}</p>
          <p className="text-xs text-muted-foreground">Click to change file</p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Drop any text file here
          </p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
        </div>
      )}
    </div>
  );
}
