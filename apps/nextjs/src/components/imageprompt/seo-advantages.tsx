"use client";

interface SEOAdvantagesProps {
  dict: {
    title: string;
    subtitle: string;
    advantages: Array<{
      title: string;
      description: string;
      keywords: string[];
    }>;
  };
}

export function SEOAdvantages({ dict }: SEOAdvantagesProps) {
  return (
    <section className="container py-16 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-6xl mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {dict.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {dict.subtitle}
          </p>
        </div>

        {/* 优势网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dict.advantages.map((advantage, index) => (
            <div
              key={index}
              className="bg-background rounded-lg p-6 border border-border hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {advantage.title}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {advantage.description}
              </p>
              {/* 关键词标签 */}
              <div className="flex flex-wrap gap-2">
                {advantage.keywords.map((keyword, keywordIndex) => (
                  <span
                    key={keywordIndex}
                    className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}