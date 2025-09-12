"use client";

import * as Icons from "@saasfly/ui/icons";
import { cn } from "@saasfly/ui";

interface ImagePreviewSectionProps {
  dict: {
    title: string;
    placeholder: string;
  };
  image?: File | string | null;
}

export function ImagePreviewSection({ dict, image }: ImagePreviewSectionProps) {
  const hasImage = Boolean(image);
  
  return (
    <div className="space-y-4">
      {/* 预览标题 */}
      <h3 className="text-lg font-medium text-foreground">
        {dict.title}
      </h3>
      
      {/* 预览区域 */}
      <div 
        className={cn(
          "border-2 border-dashed rounded-xl flex items-center justify-center transition-all duration-200",
          hasImage 
            ? "border-purple-300 bg-purple-50/50 dark:bg-purple-900/5" 
            : "border-gray-300 bg-gray-50 dark:bg-gray-800/50",
          "min-h-[300px] lg:min-h-[400px]"
        )}
      >
        {hasImage ? (
          <div className="w-full h-full p-4">
            {image instanceof File ? (
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : typeof image === "string" ? (
              <img
                src={image}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : null}
          </div>
        ) : (
          <div className="text-center p-8">
            <Icons.ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {dict.placeholder}
            </p>
          </div>
        )}
      </div>
      
      {/* 图片信息 */}
      {hasImage && image instanceof File && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>文件名: {image.name}</div>
          <div>文件大小: {(image.size / 1024 / 1024).toFixed(2)} MB</div>
          <div>文件类型: {image.type}</div>
        </div>
      )}
    </div>
  );
}