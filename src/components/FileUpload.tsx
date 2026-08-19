"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
}

export default function FileUpload({ onTextExtracted }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractPdfText = async (file: File): Promise<string> => {
    // Dynamically import pdfjs to prevent SSR execution issues
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      let extractedText = "";

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        extractedText = await extractPdfText(file);
      } else {
        extractedText = await file.text();
      }

      if (!extractedText.trim()) {
        throw new Error("No readable text found in file.");
      }

      onTextExtracted(extractedText.trim());
    } catch (err: any) {
      console.error('File Read Error:', err);
      setError(err?.message || 'Failed to read file contents.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full mb-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        accept=".pdf,.txt,.md"
        className="hidden"
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/60 hover:bg-slate-900/60 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5"
      >
        {uploading ? (
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Parsing PDF text...</span>
          </div>
        ) : fileName && !error ? (
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Loaded: {fileName}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-slate-400 hover:text-cyan-300 text-xs">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Drop PDF or text files here</span>
            <span className="text-slate-600">or click to browse</span>
          </div>
        )}

        {error && <p className="text-[11px] text-rose-400">{error}</p>}
      </div>
    </div>
  );
}