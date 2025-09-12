"use client";

import { useState } from "react";
import { Card, CardContent } from "@saasfly/ui/card";
import * as Icons from "@saasfly/ui/icons";
import { cn } from "@saasfly/ui";

interface ModelSelectionProps {
  dict: {
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
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const modelOptions = [
  {
    id: "general",
    key: "general" as const,
    icon: "CheckCircle" as const,
  },
  {
    id: "flux",
    key: "flux" as const,
    icon: "Zap" as const,
  },
  {
    id: "midjourney",
    key: "midjourney" as const,
    icon: "Palette" as const,
  },
  {
    id: "stable-diffusion",
    key: "stableDiffusion" as const,
    icon: "Settings" as const,
  },
];

export function ModelSelection({ dict, selectedModel = "general", onModelChange }: ModelSelectionProps) {
  const [internalSelectedModel, setInternalSelectedModel] = useState(selectedModel);

  const handleModelChange = (modelId: string) => {
    setInternalSelectedModel(modelId);
    onModelChange?.(modelId);
  };

  const currentSelectedModel = onModelChange ? selectedModel : internalSelectedModel;

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modelOptions.map((model) => {
          const isSelected = currentSelectedModel === model.id;
          const modelDict = dict[model.key];
          const IconComponent = Icons[model.icon];

          return (
            <Card
              key={model.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
                  : "border-gray-200 hover:border-purple-300"
              )}
              onClick={() => handleModelChange(model.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {isSelected && (
                    <Icons.Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-2 text-foreground">
                      {modelDict.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {modelDict.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}