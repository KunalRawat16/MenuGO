"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  currentUrl?: string | null;
  label?: string;
  folder?: string;
  helperText?: string;
  aspectRatio?: "square" | "banner";
}

export function FileUpload({
  onUploadSuccess,
  currentUrl,
  label = "Upload Image",
  folder = "menugo",
  helperText = "PNG, JPG, WebP up to 5MB",
  aspectRatio = "square",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setError(null);
    setIsUploading(true);

    // Create local object URL for instant visual feedback
    const tempUrl = URL.createObjectURL(file);
    setPreview(tempUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setPreview(data.url);
        onUploadSuccess(data.url);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image.");
      setPreview(currentUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onUploadSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const aspectClasses =
    aspectRatio === "banner" ? "aspect-[21/9] w-full" : "aspect-square w-36 h-36";

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label}
        </label>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative group border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden bg-slate-50/50 hover:bg-slate-50 ${
          error
            ? "border-rose-400 bg-rose-50/20"
            : isUploading
            ? "border-indigo-400 bg-indigo-50/20"
            : "border-slate-300 hover:border-indigo-500"
        } ${aspectClasses}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {preview ? (
          <div className="relative w-full h-full group/preview">
            <Image
              src={preview}
              alt="Uploaded preview"
              fill
              className="object-cover rounded-xl"
              unoptimized
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-md"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center rounded-xl">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-2 space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UploadCloud size={20} />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Click or drag & drop to upload
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
