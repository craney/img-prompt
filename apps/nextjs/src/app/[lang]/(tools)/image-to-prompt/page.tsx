import { Metadata } from "next";
import { getDictionary } from "~/lib/get-dictionary";
import type { Locale } from "~/config/i18n-config";

import { ImageToPromptClient } from "./components/image-to-prompt-client";

interface ImageToPromptPageProps {
  params: {
    lang: Locale;
  };
}

export async function generateMetadata({
  params: { lang },
}: ImageToPromptPageProps): Promise<Metadata> {
  const dict = await getDictionary(lang);

  return {
    title: dict.imageprompt.imageToPrompt.meta.title,
    description: dict.imageprompt.imageToPrompt.meta.description,
    keywords: ["AI art", "image prompt", "AI generator", "prompt engineering"],
    openGraph: {
      title: dict.imageprompt.imageToPrompt.meta.title,
      description: dict.imageprompt.imageToPrompt.meta.description,
      type: "website",
      locale: lang,
      images: [
        {
          url: "/og-imageprompt.jpg",
          width: 1200,
          height: 630,
          alt: "ImgPrompt.He - Free Image to Prompt Generator",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.imageprompt.imageToPrompt.meta.title,
      description: dict.imageprompt.imageToPrompt.meta.description,
      images: ["/og-imageprompt.jpg"],
    },
    alternates: {
      canonical: `/${lang}/image-to-prompt`,
      languages: {
        en: "/en/image-to-prompt",
        zh: "/zh/image-to-prompt",
        ko: "/ko/image-to-prompt",
        ja: "/ja/image-to-prompt",
      },
    },
  };
}

export default async function ImageToPromptPage({
  params: { lang },
}: ImageToPromptPageProps) {
  const dict = await getDictionary(lang);

  return <ImageToPromptClient dict={dict.imageprompt} />;
}