"use client";

import { useState, useCallback, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { Button } from "@saasfly/ui/button";
import { Input } from "@saasfly/ui/input";
import * as Icons from "@saasfly/ui/icons";
import { cn } from "@saasfly/ui";

interface ImageUploadSectionProps {
  dict: {
    dragText: string;
    formatText: string;
    uploadButton: string;
    urlPlaceholder: string;
  };
  onImageUpload?: (file: File | null) => void;
}

export function ImageUploadSection({ dict, onImageUpload }: ImageUploadSectionProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadingToCoze, setIsUploadingToCoze] = useState(false);
  const [cozeFileId, setCozeFileId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (PNG, JPG, or WEBP)");
      return false;
    }
    
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return false;
    }
    
    return true;
  };

  // Upload file to Coze
  const uploadToCoze = async (file: File) => {
    setIsUploadingToCoze(true);
    setUploadStatus("uploading");
    setUploadMessage("Uploading to Coze...");
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/coze/upload", {
        method: "POST",
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 100)}...`);
      }

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = result.details || result.error || "Failed to upload file to Coze";
        // Handle specific Coze API errors
        if (result.code === 700012006) {
          errorMessage = "Coze API error: Access token is invalid. Please check your API configuration.";
        }
        throw new Error(errorMessage);
      }

      console.log("File uploaded to Coze successfully:", result);
      setCozeFileId(result.fileId);
      
      // Print fileId to console as requested
      console.log("Coze File ID:", result.fileId);
      
      setUploadStatus("success");
      setUploadMessage(`File uploaded to Coze successfully! File ID: ${result.fileId}`);
      
      return result.fileId;
    } catch (error) {
      console.error("Error uploading file to Coze:", error);
      setUploadStatus("error");
      setUploadMessage(`Error uploading file to Coze: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      throw error;
    } finally {
      setIsUploadingToCoze(false);
    }
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));

    if (imageFile && validateFile(imageFile)) {
      setUploadedFile(imageFile);
      onImageUpload?.(imageFile);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setUploadedFile(file);
      onImageUpload?.(file);
    }
  };

  const handleUrlUpload = async () => {
    if (!imageUrl) return;
    
    try {
      setUploadStatus("uploading");
      setUploadMessage("Fetching image from URL...");
      
      // Fetch image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const fileName = imageUrl.split("/").pop() || "image.jpg";
      const file = new File([blob], fileName, { type: blob.type });
      
      if (validateFile(file)) {
        setUploadedFile(file);
        onImageUpload?.(file);
        setImageUrl(""); // Clear the input after successful upload
      }
    } catch (error) {
      console.error("Error uploading from URL:", error);
      setUploadStatus("error");
      setUploadMessage(`Error uploading image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert(`Error uploading image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Automatically upload to Coze when a file is selected
  useEffect(() => {
    if (uploadedFile && !cozeFileId && uploadStatus === "idle") {
      uploadToCoze(uploadedFile).catch((error) => {
        console.error("Auto upload to Coze failed:", error);
      });
    }
  }, [uploadedFile, cozeFileId, uploadStatus]);

  // Reset status when a new file is selected
  useEffect(() => {
    if (uploadedFile) {
      setCozeFileId(null);
      setUploadStatus("idle");
      setUploadMessage("");
    }
  }, [uploadedFile]);

  return (
    <div className="space-y-6">
      {/* 拖拽上传区域 */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          isDragActive
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
            : "border-purple-300 hover:border-purple-400"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Icons.Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2 text-foreground">
          {dict.dragText}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {dict.formatText}
        </p>

        <Button 
          variant="outline" 
          className="border-purple-200 text-purple-600 hover:bg-purple-50"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {dict.uploadButton}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* URL 输入区域 */}
      <div className="flex gap-2">
        <Input
          placeholder={dict.urlPlaceholder}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleUrlUpload} 
          disabled={!imageUrl || uploadStatus === "uploading"}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {uploadStatus === "uploading" ? (
            <>
              <Icons.Spinner className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </div>

      {/* 显示已上传文件信息 */}
      {uploadedFile && (
        <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Icons.Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800 dark:text-green-200">
              Uploaded: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          
          {/* Upload Status */}
          {uploadMessage && (
            <div className={`mt-2 text-sm ${
              uploadStatus === "success" ? "text-green-600 dark:text-green-300" :
              uploadStatus === "error" ? "text-red-600 dark:text-red-300" :
              "text-blue-600 dark:text-blue-300"
            }`}>
              {uploadMessage}
            </div>
          )}
          
          {cozeFileId && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Coze File ID: {cozeFileId}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(cozeFileId)}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 h-6 px-2 text-xs"
              >
                <Icons.Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}