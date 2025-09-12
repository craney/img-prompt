"use client";

import { useState, useEffect } from "react";
import { Button } from "@saasfly/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@saasfly/ui/select";
import { cn } from "@saasfly/ui";
import * as Icons from "@saasfly/ui/icons";

interface PromptGeneratorProps {
  dict: {
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
  selectedModel?: string;
  promptLanguage?: string;
  onLanguageChange?: (language: string) => void;
  uploadedImage?: File | null;
  cozeFileId?: string | null; // 添加cozeFileId属性
}

const languageOptions = [
  { value: "english", key: "english" as const },
  { value: "chinese", key: "chinese" as const },
  { value: "japanese", key: "japanese" as const },
  { value: "korean", key: "korean" as const },
];

export function PromptGenerator({ 
  dict, 
  selectedModel = "general", 
  promptLanguage = "english", 
  onLanguageChange, 
  uploadedImage,
  cozeFileId // 接收cozeFileId
}: PromptGeneratorProps) {
  const [internalLanguage, setInternalLanguage] = useState(promptLanguage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState(""); // 添加生成的提示词状态

  const currentLanguage = onLanguageChange ? promptLanguage : internalLanguage;

  const handleLanguageChange = (language: string) => {
    setInternalLanguage(language);
    onLanguageChange?.(language);
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      alert("Please upload an image first");
      return;
    }

    // 检查是否有cozeFileId
    if (!cozeFileId) {
      alert("Image not uploaded to Coze yet");
      return;
    }

    setIsGenerating(true);
    setGeneratedPrompt(""); // 清空之前的提示词
    try {
      // 映射模型类型到promptType
      const promptTypeMap: Record<string, string> = {
        "general": "Normal",
        "flux": "Flux",
        "midjourney": "Midjourney",
        "stable-diffusion": "StableDiffusion"
      };
      
      const promptType = promptTypeMap[selectedModel] || "Normal";

      // 调用后端API
      const response = await fetch("/api/coze/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId: cozeFileId, promptType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate prompt");
      }

      const result = await response.json();
      setGeneratedPrompt(result.prompt);
    } catch (error) {
      console.error("Error generating prompt:", error);
      alert(`Error generating prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 当selectedModel改变时，清空之前生成的提示词
  useEffect(() => {
    setGeneratedPrompt("");
  }, [selectedModel]);

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* 左侧：语言选择 */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">
            {dict.languageLabel}
          </label>
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {dict.languages[option.key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 中间：生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !uploadedImage || !cozeFileId}
          className={cn(
            "bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 text-base font-medium",
            (isGenerating || !uploadedImage || !cozeFileId) && "opacity-70 cursor-not-allowed"
          )}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </div>
          ) : (
            dict.generateButton
          )}
        </Button>

        {/* 右侧：版本信息 */}
        <div className="text-xs text-muted-foreground">
          {dict.version}
        </div>
      </div>

      {/* 显示生成的提示词 */}
      {generatedPrompt && (
        <div className="mt-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            Generated Prompt:
          </label>
          <textarea
            value={generatedPrompt}
            readOnly
            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 dark:bg-gray-800"
          />
        </div>
      )}
    </div>
  );
}