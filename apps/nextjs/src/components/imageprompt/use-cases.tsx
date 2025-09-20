"use client";

interface UseCasesProps {
  dict: {
    useCases: {
      title: string;
      subtitle: string;
      scenarios: Array<{
        title: string;
        description: string;
        icon: string;
        keywords: string[];
      }>;
    };
    technical: {
      title: string;
      subtitle: string;
      features: Array<{
        title: string;
        description: string;
        keywords: string[];
      }>;
    };
  };
}

import * as Icons from "@saasfly/ui/icons";

export function UseCases({ dict }: UseCasesProps) {
  return (
    <>
      {/* 使用场景部分 */}
      <section className="container py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {dict.useCases.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {dict.useCases.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dict.useCases.scenarios.map((scenario, index) => {
              const IconComponent = Icons[scenario.icon as keyof typeof Icons];

              return (
                <div
                  key={index}
                  className="bg-background rounded-lg p-6 border border-border hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {IconComponent && <IconComponent className="w-6 h-6 text-primary" />}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {scenario.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {scenario.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scenario.keywords.map((keyword, keywordIndex) => (
                      <span
                        key={keywordIndex}
                        className="inline-block bg-secondary/50 text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 技术特点部分 */}
      <section className="container py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {dict.technical.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {dict.technical.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dict.technical.features.map((feature, index) => (
              <div
                key={index}
                className="bg-background rounded-lg p-6 border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.keywords.map((keyword, keywordIndex) => (
                    <span
                      key={keywordIndex}
                      className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium"
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
    </>
  );
}