"use client";

import * as Icons from "@saasfly/ui/icons";
import { cn } from "@saasfly/ui";

interface FeatureTabsProps {
  active: "image-to-prompt";
  dict: {
    imageToPrompt: string;
  };
}

export function FeatureTabs({ active, dict }: FeatureTabsProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex bg-muted rounded-lg p-1">
        {/* Image to Prompt Tab */}
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
            active === "image-to-prompt"
              ? "bg-background text-purple-600 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icons.Image 
            className={cn(
              "w-4 h-4",
              active === "image-to-prompt" ? "text-purple-600" : "text-muted-foreground"
            )} 
          />
          {dict.imageToPrompt}
        </button>
      </div>
    </div>
  );
}