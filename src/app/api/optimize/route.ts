import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { OptimizationResult, TextAnalysis, SeoMetadata } from '@/types/text-analysis';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const requestSchema = z.object({
  texts: z.array(z.string().min(1, 'Der Text darf nicht leer sein')),
  keywords: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  seoFocus: z.string().optional(),
  language: z.enum(['de', 'en'], {
    errorMap: () => ({ message: 'Sprache muss entweder "de" oder "en" sein' })
  }),
  title: z.string().min(1, 'Der Titel ist erforderlich').max(60, 'Der Titel darf maximal 60 Zeichen lang sein'),
});

function calculateFleschIndex(text: string): number {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const syllables = text.toLowerCase().replace(/[^aeiouy]+/g, ' ').trim().split(/\s+/).length;
  
  return Math.round(180 - (words / sentences) - (58.5 * syllables / words));
}

function analyzeTextLength(text: string): TextAnalysis['textLength'] {
  const length = text.length;
  return {
    current: length,
    recommended: 1000,
    status: length < 500 ? 'too_short' : length > 1000 ? 'too_long' : 'optimal',
  };
}

function analyzeReadability(text: string): TextAnalysis['readability'] {
  const fleschIndex = calculateFleschIndex(text);
  const sentences = text.split(/[.!?]+/);
  const avgSentenceLength = sentences.reduce((acc, sentence) => {
    return acc + sentence.split(/\s+/).length;
  }, 0) / sentences.length;

  let complexity: 'easy' | 'medium' | 'complex';
  if (fleschIndex > 80) complexity = 'easy';
  else if (fleschIndex > 60) complexity = 'medium';
  else complexity = 'complex';

  return {
    fleschIndex,
    avgSentenceLength: Math.round(avgSentenceLength),
    complexity
  };
}

function analyzeKeywordDensity(text: string, keywords?: string[]): TextAnalysis['keywordDensity'] {
  const totalDensity = keywords ? (keywords.length * 100) / text.split(' ').length : 0;
  return {
    totalDensity,
    status: totalDensity < 1 ? 'too_low' : totalDensity > 5 ? 'too_high' : 'optimal',
    distribution: keywords?.map(keyword => ({
      keyword,
      density: (text.toLowerCase().split(keyword.toLowerCase()).length - 1) * 100 / text.split(' ').length,
    })) || [],
  };
}

function generateSeoMetadata(text: string, title: string, language: 'de' | 'en'): SeoMetadata {
  // Extrahiere die wichtigsten Keywords aus Text und Titel
  const combinedText = `${title} ${text}`.toLowerCase();
  const words = combinedText.split(/\W+/);
  
  // Entferne Stoppwörter und kurze Wörter
  const stopWords = language === 'de' 
    ? ['der', 'die', 'das', 'und', 'oder', 'aber', 'für', 'mit', 'bei', 'seit', 'von', 'aus', 'nach', 'bei', 'zu', 'zum', 'zur', 'in', 'im', 'an', 'am', 'auf', 'über', 'unter', 'hinter', 'neben', 'zwischen']
    : ['the', 'and', 'or', 'but', 'for', 'with', 'at', 'by', 'from', 'to', 'in', 'on', 'of', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];

  const wordFrequency = words.reduce((acc, word) => {
    if (word.length > 3 && !stopWords.includes(word)) {
      acc[word] = (acc[word] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Sortiere nach Häufigkeit und wähle die Top-Keywords
  const keywords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  // Generiere LSI Keywords basierend auf semantischer Ähnlichkeit
  const lsiKeywords = keywords.map(keyword => {
    const variations = language === 'de' 
      ? [
          // Singular/Plural
          `${keyword}e`, `${keyword}en`, `${keyword}er`, `${keyword}es`,
          // Verwandte Begriffe
          `${keyword}ung`, `${keyword}lich`, `${keyword}keit`,
          // Zusammengesetzte Wörter
          `${keyword}bereich`, `${keyword}system`, `${keyword}prozess`
        ]
      : [
          // Singular/Plural
          `${keyword}s`, `${keyword}ing`, `${keyword}ed`, `${keyword}er`,
          // Related terms
          `${keyword}al`, `${keyword}ity`, `${keyword}ion`,
          // Compound words
          `${keyword}system`, `${keyword}process`, `${keyword}management`
        ];
    return variations;
  }).flat().filter(word => word.length > 3);

  // Generiere Meta-Beschreibung mit Keywords
  const firstSentence = text.split(/[.!?]/)[0].trim();
  const topKeywords = keywords.slice(0, 3);
  
  let metaDescription = firstSentence;
  if (metaDescription.length < 155) {
    // Füge weitere Keywords hinzu, wenn Platz ist
    const remainingKeywords = topKeywords.filter(k => !metaDescription.toLowerCase().includes(k));
    if (remainingKeywords.length > 0) {
      const additionalText = language === 'de'
        ? ` Erfahren Sie mehr über ${remainingKeywords.join(', ')}.`
        : ` Learn more about ${remainingKeywords.join(', ')}.`;
      
      if (metaDescription.length + additionalText.length <= 155) {
        metaDescription += additionalText;
      }
    }
  }

  // Stelle sicher, dass die Meta-Beschreibung nicht zu lang ist
  metaDescription = metaDescription.substring(0, 155);

  return {
    title: `${title} | ${language === 'de' ? 'Ihre Website' : 'Your Website'}`,
    metaDescription,
    ogTitle: title,
    ogDescription: metaDescription,
    twitterTitle: title,
    twitterDescription: metaDescription,
    keywords,
    lsiKeywords: [...new Set(lsiKeywords)], // Entferne Duplikate
  };
}

function analyzeStructure(text: string): TextAnalysis['structure'] {
  const paragraphs = text.split('\n\n').length;
  const headings = (text.match(/^#{1,6}\s+.+$/gm) || []).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgParagraphLength = text.split('\n\n').reduce((acc, p) => acc + p.length, 0) / paragraphs;

  const recommendations = [];
  
  if (headings < 2) {
    recommendations.push('Mehr Überschriften einbauen');
  }
  if (avgParagraphLength > 200) {
    recommendations.push('Lange Absätze kürzen');
  }
  if (sentences < 5) {
    recommendations.push('Mehr Sätze hinzufügen');
  }

  return {
    headings,
    paragraphs,
    recommendations,
    avgParagraphLength: Math.round(avgParagraphLength),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validiere die Anfragedaten
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          error: 'Ungültige Anfragedaten', 
          details: errors,
          message: 'Bitte überprüfen Sie die eingegebenen Daten'
        },
        { status: 400 }
      );
    }

    const { texts, keywords, language, targetAudience, tone, title } = validationResult.data;

    const text = texts[0];
    const seoMetadata = generateSeoMetadata(text, title, language);

    const prompt = `
      Optimiere den folgenden Text für SEO und Lesbarkeit:
      Titel: ${title}
      ${text}
      
      ${keywords ? `Verwende diese Schlüsselwörter: ${keywords.join(', ')}` : ''}
      ${targetAudience ? `Zielgruppe: ${targetAudience}` : ''}
      ${tone ? `Ton: ${tone}` : ''}
      
      Wichtige Hinweise:
      - Textlänge maximal 1000 Zeichen
      - Keine Personalpronomen verwenden
      - Keine Aufzählungen verwenden
      - Klare, prägnante Sätze
      - Natürliche Keyword-Platzierung
      - Gute Lesbarkeit
      - Locker gesprochener Text
      
      SEO-Headline-Struktur:
      - H2: 1-3 Unterüberschriften mit relevanten Keywords
      - H3: Weitere Unterpunkte bei Bedarf
      - Keywords in Überschriften natürlich einbauen
      - Überschriften als Fragen oder Aussagen formulieren
      - Klare Hierarchie der Überschriften
      
      Antworte im Format:
      OPTIMIZED_TEXT:
      [optimierter Text]
      
      META_DESCRIPTION:
      [Meta-Beschreibung mit Keywords]
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
    });

    const response = completion.choices[0].message.content;
    const [optimizedText, metaDescription] = response
      ?.split('META_DESCRIPTION:')
      .map(part => part.replace('OPTIMIZED_TEXT:', '').trim()) || ['', ''];

    const result: OptimizationResult = {
      metaDescription: metaDescription || seoMetadata.metaDescription,
      optimizedTexts: [{
        text: optimizedText || text,
        analysis: {
          textLength: analyzeTextLength(optimizedText || text),
          readability: analyzeReadability(optimizedText || text),
          keywordDensity: analyzeKeywordDensity(optimizedText || text, keywords),
          structure: analyzeStructure(optimizedText || text),
        },
      }],
      keywords: [...keywords || [], ...seoMetadata.keywords, ...seoMetadata.lsiKeywords],
      seoMetadata: {
        ...seoMetadata,
        metaDescription: metaDescription || seoMetadata.metaDescription,
        ogDescription: metaDescription || seoMetadata.metaDescription,
        twitterDescription: metaDescription || seoMetadata.metaDescription,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error optimizing text:', error);
    
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          error: 'Validierungsfehler', 
          details: errors,
          message: 'Bitte überprüfen Sie die eingegebenen Daten'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Interner Serverfehler', 
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
        message: 'Ein unerwarteter Fehler ist aufgetreten'
      },
      { status: 500 }
    );
  }
} 