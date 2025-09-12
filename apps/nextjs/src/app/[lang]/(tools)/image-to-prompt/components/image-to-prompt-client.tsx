"use client";

import { useState } from "react";

import { ImageToPromptHeader } from "./image-to-prompt-header";
import { FeatureTabs } from "./feature-tabs";
import { ImageUploadSection } from "./image-upload-section";
import { ImagePreviewSection } from "./image-preview-section";
import { ModelSelection } from "./model-selection";
import { PromptGenerator } from "./prompt-generator";

interface ImageToPromptClientProps {
  dict: {
    imageToPrompt: {
      header: {
        title: string;
        subtitle: string;
      };
      tabs: {
        imageToPrompt: string;
        textToPrompt: string;
      };
      upload: {
        dragText: string;
        formatText: string;
        uploadButton: string;
        urlPlaceholder: string;
      };
      preview: {
        title: string;
        placeholder: string;
      };
      models: {
        general: {
          title: string;
          description: string;
        };
        flux: {
          title: string;
          description: string;
        };
        midjourney: {
          title: string;
          description: string;
        };
        stableDiffusion: {
          title: string;
          description: string;
        };
      };
      generator: {
        languageLabel: string;
        generateButton: string;
        version: string;
        languages: {
          english: string;
          chinese: string;
          japanese: string;
          korean: string;
        };
      };
    };
  };
}

export function ImageToPromptClient({ dict }: ImageToPromptClientProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState("general");
  const [promptLanguage, setPromptLanguage] = useState("english");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 页面头部 */}
      <ImageToPromptHeader dict={dict.imageToPrompt.header} />

      {/* 功能切换标签 */}
      <FeatureTabs active="image-to-prompt" dict={dict.imageToPrompt.tabs} />

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* 左侧上传区域 */}
        <ImageUploadSection 
          dict={dict.imageToPrompt.upload}
          onImageUpload={setUploadedImage}
        />

        {/* 右侧预览区域 */}
        <ImagePreviewSection 
          dict={dict.imageToPrompt.preview}
          image={uploadedImage}
        />
      </div>

      {/* AI模型选择 */}
      <ModelSelection 
        dict={dict.imageToPrompt.models}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* 底部操作区域 */}
      <PromptGenerator 
        dict={dict.imageToPrompt.generator}
        selectedModel={selectedModel}
        promptLanguage={promptLanguage}
        onLanguageChange={setPromptLanguage}
        uploadedImage={uploadedImage}
      />
    </div>
  );
}