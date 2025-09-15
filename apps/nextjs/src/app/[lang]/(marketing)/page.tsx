import type { Metadata } from "next";
import { getDictionary } from "~/lib/get-dictionary";

import { ImagePromptHeroSection } from "~/components/imageprompt/hero-section";
import { ImagePromptFeaturesGrid } from "~/components/imageprompt/features-grid";
import { ImagePromptToolsSuite } from "~/components/imageprompt/tools-suite";

import type { Locale } from "~/config/i18n-config";

export async function generateMetadata({
  params: { lang }
}: {
  params: { lang: Locale }
}): Promise<Metadata> {
  const dict = await getDictionary(lang);
  
  return {
    title: dict.imageprompt.meta.title,
    description: dict.imageprompt.meta.description,
    keywords: ['AI art', 'image prompt', 'AI generator', 'prompt engineering'],
    openGraph: {
      title: dict.imageprompt.meta.title,
      description: dict.imageprompt.meta.description,
      type: 'website',
      locale: lang,
      images: [
        {
          url: '/og-imageprompt.jpg',
          width: 1200,
          height: 630,
          alt: 'ImagePrompt.org - Create Better AI Art'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.imageprompt.meta.title,
      description: dict.imageprompt.meta.description,
      images: ['/og-imageprompt.jpg']
    },
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'en': '/en',
        'zh': '/zh', 
        'ko': '/ko',
        'ja': '/ja'
      }
    }
  };
}

export default async function ImagePromptHomePage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);

  return (
    <>
      {/* Hero Section */}
      <ImagePromptHeroSection dict={dict.imageprompt.hero} lang={lang} />
      
      {/* Features Grid */}
      <ImagePromptFeaturesGrid 
        features={dict.imageprompt.features.map(feature => ({
          ...feature,
          // 为图片转提示词功能添加链接
          href: feature.id === 'image_to_prompt' ? `/${lang}/image-to-prompt` : undefined
        }))}
        interested={dict.imageprompt.interested}
      />
      
      {/* Tools Suite */}
      <ImagePromptToolsSuite dict={dict.imageprompt.tools} />
    </>
  );
}
