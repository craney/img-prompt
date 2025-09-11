"use client";

interface ImagePromptToolsSuiteProps {
  dict: {
    title: string;
    subtitle: string;
  };
}

export function ImagePromptToolsSuite({ dict }: ImagePromptToolsSuiteProps) {
  return (
    <section className="container py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
          {dict.title}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          {dict.subtitle}
        </p>
      </div>
    </section>
  );
}