import { KeywordDensityAnalysis as KeywordDensityAnalysisType } from '@/types/text-analysis';
import { TRANSLATIONS } from '@/config/translations';

interface KeywordDensityAnalysisProps {
  analysis: KeywordDensityAnalysisType;
  language: 'de' | 'en';
}

export function KeywordDensityAnalysis({ analysis, language }: KeywordDensityAnalysisProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-500';
      case 'too_low':
      case 'too_high':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">{TRANSLATIONS[language].keywordDensity}</h4>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].totalDensity}</p>
            <p className="font-medium">{analysis.totalDensity}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].status}</p>
            <p className={`font-medium ${getStatusColor(analysis.status)}`}>
              {TRANSLATIONS[language][`status${analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}`]}
            </p>
          </div>
        </div>
        
        {analysis.distribution.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">{TRANSLATIONS[language].distribution}</p>
            <div className="space-y-2">
              {analysis.distribution.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{item.keyword}</span>
                  <span>{item.density}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 