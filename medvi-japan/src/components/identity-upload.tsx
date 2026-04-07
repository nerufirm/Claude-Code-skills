"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Check, X, FileImage, Loader2 } from "lucide-react";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface IdentityUploadProps {
  onUploadComplete?: (url: string) => void;
  existingUrl?: string;
}

export function IdentityUpload({ onUploadComplete, existingUrl }: IdentityUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback((file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("対応していないファイル形式です。JPEG、PNG、WebP、またはPDFをアップロードしてください。");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズが大きすぎます。10MB以下のファイルをアップロードしてください。");
      return;
    }

    setSelectedFile(file);
    setUploadedUrl(null);

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload/identity", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "アップロードに失敗しました");
      }

      setUploadedUrl(data.url);
      setSelectedFile(null);
      onUploadComplete?.(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload complete state
  if (uploadedUrl) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
            <Check className="size-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">
              本人確認書類がアップロードされました
            </p>
            {uploadedUrl.match(/\.(jpe?g|png|webp)(\?|$)/i) ? (
              <img
                src={uploadedUrl}
                alt="本人確認書類"
                className="mt-2 max-h-32 rounded border object-contain"
              />
            ) : (
              <p className="text-xs text-green-600 mt-1 truncate">{uploadedUrl}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setUploadedUrl(null);
              setPreview(null);
            }}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            変更
          </Button>
        </div>
      </div>
    );
  }

  // File selected state
  if (selectedFile) {
    return (
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-center gap-3">
          {preview ? (
            <img
              src={preview}
              alt="プレビュー"
              className="size-16 rounded border object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded border bg-muted">
              <FileImage className="size-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            disabled={isUploading}
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-3 w-full"
          size="sm"
        >
          {isUploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <Upload className="size-4" />
              アップロード
            </>
          )}
        </Button>
      </div>
    );
  }

  // Default dropzone state
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <Upload className="size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">
          ファイルをドラッグ＆ドロップ
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          またはクリックしてファイルを選択
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          JPEG, PNG, WebP, PDF（10MB以下）
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
