'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CopyButton } from '@/components/ui/copy-button';
import { TextAnalysis } from '@/components/text-analysis/text-analysis';
import { useTextOptimizer } from '@/hooks/use-text-optimizer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TARGET_AUDIENCES = {
  de: [
    { value: 'family', label: 'Familien & Privatpersonen' },
    { value: 'education', label: 'Bildung & Wissenschaft' },
    { value: 'creative', label: 'Kreative & Kultur' },
    { value: 'technical', label: 'Technik & Digital' },
    { value: 'health', label: 'Gesundheit & Wellness' },
    { value: 'general', label: 'Allgemeine Öffentlichkeit' },
  ],
  en: [
    { value: 'family', label: 'Families & Private Individuals' },
    { value: 'education', label: 'Education & Science' },
    { value: 'creative', label: 'Creative & Cultural' },
    { value: 'technical', label: 'Technical & Digital' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'general', label: 'General Public' },
  ],
};

const TONES = {
  de: [
    { value: 'friendly', label: 'Freundlich & Persönlich' },
    { value: 'professional', label: 'Professionell & Formell' },
    { value: 'educational', label: 'Bildend & Erklärend' },
    { value: 'engaging', label: 'Engagiert & Überzeugend' },
    { value: 'casual', label: 'Locker & Umgangssprachlich' },
    { value: 'neutral', label: 'Neutral & Sachlich' },
  ],
  en: [
    { value: 'friendly', label: 'Friendly & Personal' },
    { value: 'professional', label: 'Professional & Formal' },
    { value: 'educational', label: 'Educational & Explanatory' },
    { value: 'engaging', label: 'Engaging & Persuasive' },
    { value: 'casual', label: 'Casual & Conversational' },
    { value: 'neutral', label: 'Neutral & Factual' },
  ],
};

const TRANSLATIONS = {
  de: {
    title: 'Text Optimierung',
    titleLabel: 'Titel',
    titlePlaceholder: 'Geben Sie einen Titel ein...',
    textLabel: 'Text',
    textPlaceholder: 'Geben Sie Ihren Text hier ein...',
    keywordsLabel: 'Schlüsselwörter',
    keywordsPlaceholder: 'Schlüsselwörter durch Kommas getrennt',
    targetAudienceLabel: 'Zielgruppe',
    targetAudiencePlaceholder: 'Wählen Sie eine Zielgruppe',
    toneLabel: 'Ton',
    tonePlaceholder: 'Wählen Sie einen Ton',
    optimizeButton: 'Text optimieren',
    optimizingButton: 'Optimiere...',
    metaDescription: 'Meta-Beschreibung',
    optimizedText: 'Optimierter Text',
    addTextButton: 'Weiteren Text hinzufügen',
    removeButton: 'Entfernen',
    seoMetadata: 'SEO Metadaten',
    ogTags: 'Open Graph Tags',
    twitterTags: 'Twitter Cards',
    keywords: 'Schlüsselwörter',
    lsiKeywords: 'LSI Schlüsselwörter',
    copyAll: 'Alle Metadaten kopieren',
    textAnalysis: 'Textanalyse',
    expandAll: 'Alle aufklappen',
    collapseAll: 'Alle einklappen',
  },
  en: {
    title: 'Text Optimization',
    titleLabel: 'Title',
    titlePlaceholder: 'Enter a title...',
    textLabel: 'Text',
    textPlaceholder: 'Enter your text here...',
    keywordsLabel: 'Keywords',
    keywordsPlaceholder: 'Keywords separated by commas',
    targetAudienceLabel: 'Target Audience',
    targetAudiencePlaceholder: 'Select a target audience',
    toneLabel: 'Tone',
    tonePlaceholder: 'Select a tone',
    optimizeButton: 'Optimize Text',
    optimizingButton: 'Optimizing...',
    metaDescription: 'Meta Description',
    optimizedText: 'Optimized Text',
    addTextButton: 'Add Another Text',
    removeButton: 'Remove',
    seoMetadata: 'SEO Metadata',
    ogTags: 'Open Graph Tags',
    twitterTags: 'Twitter Cards',
    keywords: 'Keywords',
    lsiKeywords: 'LSI Keywords',
    copyAll: 'Copy All Metadata',
    textAnalysis: 'Text Analysis',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
  },
};

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(60, 'Title must be less than 60 characters'),
  texts: z.array(z.object({ value: z.string().min(1, 'Text is required') })),
  keywords: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const { isLoading, error, validationErrors, result, optimizeText } = useTextOptimizer({ language });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      texts: [{ value: '' }],
      keywords: '',
      targetAudience: 'family',
      tone: 'casual',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'texts',
  });

  const onSubmit = async (values: FormValues) => {
    const combinedText = values.texts.map(t => t.value).join('\n\n');
    const keywords = values.keywords ? values.keywords.split(',').map(k => k.trim()) : undefined;
    await optimizeText({ 
      texts: [combinedText], 
      keywords,
      targetAudience: values.targetAudience,
      tone: values.tone,
      seoFocus: 'content',
      title: values.title,
    });
  };

  const handleAddText = () => {
    append({ value: '' });
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{TRANSLATIONS[language].title}</h1>
          <Button
            variant="outline"
            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
          >
            {language === 'de' ? 'EN' : 'DE'}
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{TRANSLATIONS[language].titleLabel}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={TRANSLATIONS[language].titlePlaceholder}
                      maxLength={60}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`texts.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>{TRANSLATIONS[language].textLabel} {index + 1}</FormLabel>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          {TRANSLATIONS[language].removeButton}
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder={TRANSLATIONS[language].textPlaceholder}
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddText}
            >
              {TRANSLATIONS[language].addTextButton}
            </Button>

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{TRANSLATIONS[language].keywordsLabel}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={TRANSLATIONS[language].keywordsPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{TRANSLATIONS[language].targetAudienceLabel}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={TRANSLATIONS[language].targetAudiencePlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TARGET_AUDIENCES[language].map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{TRANSLATIONS[language].toneLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={TRANSLATIONS[language].tonePlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TONES[language].map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? TRANSLATIONS[language].optimizingButton : TRANSLATIONS[language].optimizeButton}
            </Button>
          </form>
        </Form>

        {error && (
          <div className="p-4 bg-red-50 text-red-500 rounded-lg">
            <p className="font-medium">{error}</p>
            {validationErrors.length > 0 && (
              <ul className="mt-2 list-disc list-inside">
                {validationErrors.map((err, index) => (
                  <li key={index}>
                    {err.field}: {err.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Optimierter Text */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                {result.optimizedTexts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">
                        {TRANSLATIONS[language].optimizedText}
                      </h2>
                      <CopyButton text={result.optimizedTexts[0].text} language={language} />
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.optimizedTexts[0].text}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Metadaten Box */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      {TRANSLATIONS[language].seoMetadata}
                    </h2>
                    <CopyButton 
                      text={`<title>${result.seoMetadata.title}</title>
<meta name="description" content="${result.seoMetadata.metaDescription}">
<meta property="og:title" content="${result.seoMetadata.ogTitle}">
<meta property="og:description" content="${result.seoMetadata.ogDescription}">
<meta name="twitter:title" content="${result.seoMetadata.twitterTitle}">
<meta name="twitter:description" content="${result.seoMetadata.twitterDescription}">
<meta name="keywords" content="${result.seoMetadata.keywords.join(', ')}">`} 
                      language={language} 
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">{TRANSLATIONS[language].title}</h3>
                      <p className="text-sm text-muted-foreground">{result.seoMetadata.title}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">{TRANSLATIONS[language].metaDescription}</h3>
                      <p className="text-sm text-muted-foreground">{result.seoMetadata.metaDescription}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">{TRANSLATIONS[language].ogTags}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Title: {result.seoMetadata.ogTitle}</p>
                        <p>Description: {result.seoMetadata.ogDescription}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">{TRANSLATIONS[language].twitterTags}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Title: {result.seoMetadata.twitterTitle}</p>
                        <p>Description: {result.seoMetadata.twitterDescription}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">{TRANSLATIONS[language].keywords}</h3>
                      <p className="text-sm text-muted-foreground">{result.seoMetadata.keywords.join(', ')}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">{TRANSLATIONS[language].lsiKeywords}</h3>
                      <p className="text-sm text-muted-foreground">{result.seoMetadata.lsiKeywords.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Textanalyse Box */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">
                    {TRANSLATIONS[language].textAnalysis}
                  </h2>
                  <div className="space-y-4">
                    <TextAnalysis analysis={result.optimizedTexts[0].analysis} language={language} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
