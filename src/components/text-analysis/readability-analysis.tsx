import { ReadabilityAnalysis as ReadabilityAnalysisType } from '@/types/text-analysis';
import { TRANSLATIONS } from '@/config/translations';

interface ReadabilityAnalysisProps {
  analysis: ReadabilityAnalysisType;
  language: 'de' | 'en';
}

export function ReadabilityAnalysis({ analysis, language }: ReadabilityAnalysisProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'complex':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">{TRANSLATIONS[language].readability}</h4>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].fleschIndex}</p>
          <p className="font-medium">{analysis.fleschIndex}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].avgSentenceLength}</p>
          <p className="font-medium">{analysis.avgSentenceLength}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].complexity}</p>
          <p className={`font-medium ${getComplexityColor(analysis.complexity)}`}>
            {TRANSLATIONS[language][`complexity${analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)}`]}
          </p>
        </div>
      </div>
    </div>
  );
} 