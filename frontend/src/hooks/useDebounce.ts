import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debounce a un valor
 * @param value - Valor a aplicar debounce
 * @param delay - Tiempo de espera en ms (default: 500ms)
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}