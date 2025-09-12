"use client";

import { useState } from "react";
import { Button } from "@saasfly/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@saasfly/ui/select";
import { cn } from "@saasfly/ui";

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
  uploadedImage 
}: PromptGeneratorProps) {
  const [internalLanguage, setInternalLanguage] = useState(promptLanguage);
  const [isGenerating, setIsGenerating] = useState(false);

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

    setIsGenerating(true);
    try {
      // TODO: 实现实际的AI提示词生成逻辑
      console.log("Generating prompt for model:", selectedModel, "in language:", currentLanguage);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟API调用
    } catch (error) {
      console.error("Error generating prompt:", error);
    } finally {
      setIsGenerating(false);
    }
  };

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
          disabled={isGenerating || !uploadedImage}
          className={cn(
            "bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 text-base font-medium",
            (isGenerating || !uploadedImage) && "opacity-70 cursor-not-allowed"
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
    </div>
  );
}