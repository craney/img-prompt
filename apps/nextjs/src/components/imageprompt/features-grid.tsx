"use client";

import * as Icons from "@saasfly/ui/icons";
import Link from "next/link";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string; // 改为字符串类型，运行时动态获取图标
  href?: string; // 可选的链接地址
}

interface ImagePromptFeaturesGridProps {
  features: Feature[];
  interested: {
    prefix: string;
    links: Array<{ text: string; href: string }>;
  };
}

export function ImagePromptFeaturesGrid({ 
  features, 
  interested 
}: ImagePromptFeaturesGridProps) {
  return (
    <section className="container py-16">
      {/* 功能网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {features.map((feature) => {
          const IconComponent = Icons[feature.icon as keyof typeof Icons];
          
          return (
            <Link 
              key={feature.id}
              href={feature.href || '#'}
              className="flex flex-col items-center text-center p-6 group hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              {/* 图标圆圈 */}
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors">
                {IconComponent && <IconComponent className="w-8 h-8 text-purple-600" />}
              </div>
              
              {/* 功能标题 */}
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              
              {/* 功能描述 */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </Link>
          );
        })}
      </div>
      
      {/* 相关链接 */}
      <div className="flex flex-col items-center text-center">
        <p className="text-muted-foreground mb-4">
          {interested.prefix}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {interested.links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-purple-600 hover:text-purple-700 underline hover:no-underline transition-colors"
            >
              {link.text}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}