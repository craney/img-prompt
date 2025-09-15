"use client";

import Link from "next/link";
import { ColourfulText } from "@saasfly/ui/colorful-text";
import { Button } from "@saasfly/ui/button";

interface ImagePromptHeroSectionProps {
  dict: {
    title_prefix: string;
    title_highlight: string;
    title_suffix: string;
    subtitle: string;
    cta_primary: string;
    cta_secondary: string;
  };
  lang: string;
}

export function ImagePromptHeroSection({ dict, lang }: ImagePromptHeroSectionProps) {
  const targetPath = `/${lang}/image-to-prompt`;

  return (
    <section className="container pt-20 pb-16">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* 主标题 - 使用 ColourfulText 突出品牌 */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {dict.title_prefix}{" "}
          <ColourfulText text={dict.title_highlight} />
          {dict.title_suffix && ` ${dict.title_suffix}`}
        </h1>
        
        {/* 副标题 */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
          {dict.subtitle}
        </p>
        
        {/* CTA 按钮组 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href={targetPath} prefetch={true}>
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-full w-full"
            >
              {dict.cta_primary}
            </Button>
          </Link>
          <Link href={targetPath} prefetch={true}>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-3 text-lg rounded-full w-full"
            >
              {dict.cta_secondary}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}