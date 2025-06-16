import { useState } from 'react';
import { OptimizationResult } from '@/types/text-analysis';

interface ValidationError {
  field: string;
  message: string;
}

interface ErrorResponse {
  error: string;
  details?: ValidationError[];
  message: string;
}

interface OptimizeTextParams {
  texts: string[];
  keywords?: string[];
  targetAudience?: string;
  tone?: string;
  seoFocus?: string;
  title: string;
}

interface UseTextOptimizerProps {
  language: 'de' | 'en';
}

export function useTextOptimizer({ language }: UseTextOptimizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const optimizeText = async (params: OptimizeTextParams) => {
    setIsLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        setError(errorData.message);
        if (errorData.details) {
          setValidationErrors(errorData.details);
        }
        throw new Error(errorData.message);
      }

      setResult(data);
    } catch (err) {
      if (!(err instanceof Error)) {
        setError('Ein unerwarteter Fehler ist aufgetreten');
      }
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    validationErrors,
    result,
    optimizeText,
  };
} 