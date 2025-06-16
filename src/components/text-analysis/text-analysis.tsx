import { TextLengthAnalysis } from './text-length-analysis';
import { ReadabilityAnalysis } from './readability-analysis';
import { KeywordDensityAnalysis } from './keyword-density-analysis';
import { StructureAnalysis } from './structure-analysis';
import { TextAnalysis as TextAnalysisType } from '@/types/text-analysis';
import { TRANSLATIONS } from '@/config/translations';

interface TextAnalysisProps {
  analysis: TextAnalysisType;
  language: 'de' | 'en';
}

export function TextAnalysis({ analysis, language }: TextAnalysisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Linke Spalte: Textlänge und Lesbarkeit */}
      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/50 p-4">
          <TextLengthAnalysis analysis={analysis.textLength} language={language} />
        </div>
        <div className="rounded-lg border bg-muted/50 p-4">
          <ReadabilityAnalysis analysis={analysis.readability} language={language} />
        </div>
      </div>

      {/* Rechte Spalte: Keyword-Dichte und Struktur */}
      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/50 p-4">
          <KeywordDensityAnalysis analysis={analysis.keywordDensity} language={language} />
        </div>
        <div className="rounded-lg border bg-muted/50 p-4">
          <StructureAnalysis analysis={analysis.structure} language={language} />
        </div>
      </div>
    </div>
  );
} 