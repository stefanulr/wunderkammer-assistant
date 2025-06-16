import { StructureAnalysis as StructureAnalysisType } from '@/types/text-analysis';
import { TRANSLATIONS } from '@/config/translations';

interface StructureAnalysisProps {
  analysis: StructureAnalysisType;
  language: 'de' | 'en';
}

export function StructureAnalysis({ analysis, language }: StructureAnalysisProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">{TRANSLATIONS[language].structure}</h4>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].headings}</p>
            <p className="font-medium">{analysis.headings}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{TRANSLATIONS[language].paragraphs}</p>
            <p className="font-medium">{analysis.paragraphs}</p>
          </div>
        </div>
        
        {analysis.recommendations.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">{TRANSLATIONS[language].recommendations}</p>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm">{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 