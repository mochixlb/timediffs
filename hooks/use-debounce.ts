import { useEffect, useState } from 'react';

/**
 * Custom hook that debounces a value.
 * Returns the debounced value that updates after the specified delay.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * const [input, setInput] = useState('');
 * const debouncedInput = useDebounce(input, 200);
 * 
 * useEffect(() => {
 *   // This will only run after user stops typing for 200ms
 *   performSearch(debouncedInput);
 * }, [debouncedInput]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the debounce timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel the timer if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

