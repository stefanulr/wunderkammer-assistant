export interface TextLengthAnalysis {
  current: number;
  recommended: number;
  status: 'optimal' | 'too_short' | 'too_long';
}

export interface ReadabilityAnalysis {
  fleschIndex: number;
  avgSentenceLength: number;
  complexity: 'easy' | 'medium' | 'complex';
}

export interface KeywordDensityAnalysis {
  totalDensity: number;
  status: 'optimal' | 'too_low' | 'too_high';
  distribution: {
    keyword: string;
    density: number;
  }[];
}

export interface StructureAnalysis {
  headings: number;
  paragraphs: number;
  recommendations: string[];
}

export interface TextAnalysis {
  textLength: {
    current: number;
    recommended: number;
    status: 'too_short' | 'optimal' | 'too_long';
  };
  readability: {
    fleschIndex: number;
    avgSentenceLength: number;
    complexity: 'easy' | 'medium' | 'complex';
  };
  keywordDensity: {
    totalDensity: number;
    status: 'too_low' | 'optimal' | 'too_high';
    distribution: Array<{
      keyword: string;
      density: number;
    }>;
  };
  structure: {
    headings: number;
    paragraphs: number;
    recommendations: string[];
    avgParagraphLength: number;
  };
}

export interface TextBlock {
  text: string;
  analysis: TextAnalysis;
}

export interface SeoMetadata {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  keywords: string[];
  lsiKeywords: string[];
}

export interface OptimizationResult {
  metaDescription: string;
  optimizedTexts: Array<{
    text: string;
    analysis: TextAnalysis;
  }>;
  keywords?: string[];
  seoMetadata: SeoMetadata;
} 