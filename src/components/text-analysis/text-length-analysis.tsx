import { TextLengthAnalysis as TextLengthAnalysisType } from '@/types/text-analysis';
import { TRANSLATIONS } from '@/config/translations';

interface TextLengthAnalysisProps {
  analysis: TextLengthAnalysisType;
  language: 'de' | 'en';
}

export function TextLengthAnalysis({ analysis, language }: TextLengthAnalysisProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-500';
      case 'too_short':
      case 'too_long':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">{TRANSLATIONS[language].textLength}</h4>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].length}</p>
          <p className="font-medium">{analysis.current}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].recommended}</p>
          <p className="font-medium">{analysis.recommended}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].status}</p>
          <p className={`font-medium ${getStatusColor(analysis.status)}`}>
            {TRANSLATIONS[language][`status${analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}`]}
          </p>
        </div>
      </div>
    </div>
  );
} 