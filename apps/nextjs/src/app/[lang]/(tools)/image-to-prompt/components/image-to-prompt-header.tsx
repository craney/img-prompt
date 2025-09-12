"use client";

interface ImageToPromptHeaderProps {
  dict: {
    title: string;
    subtitle: string;
  };
}

export function ImageToPromptHeader({ dict }: ImageToPromptHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
        {dict.title}
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        {dict.subtitle}
      </p>
    </div>
  );
}