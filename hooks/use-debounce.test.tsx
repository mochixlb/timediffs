import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    act(() => {
      rerender({ value: 'updated', delay: 300 });
    });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 299ms (just before delay)
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    // Fast-forward to complete delay
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should respect custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    act(() => {
      rerender({ value: 'updated', delay: 500 });
    });

    // Should not update before delay
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    // Should update after delay
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should use default delay of 300ms when not provided', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      {
        initialProps: { value: 'initial' },
      }
    );

    act(() => {
      rerender({ value: 'updated' });
    });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should cancel previous debounce when value changes rapidly', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    // Rapid changes
    act(() => {
      rerender({ value: 'first', delay: 300 });
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      rerender({ value: 'second', delay: 300 });
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      rerender({ value: 'third', delay: 300 });
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should still be initial (none of the rapid changes should have completed)
    expect(result.current).toBe('initial');

    // Complete the delay from the last change
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // State should update after timer completes
    expect(result.current).toBe('third');
  });

  it('should handle number values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 300 },
      }
    );

    act(() => {
      rerender({ value: 42, delay: 300 });
    });
    
    act(() => {
      vi.runAllTimers();
    });
    
    expect(result.current).toBe(42);
  });

  it('should handle boolean values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: false, delay: 300 },
      }
    );

    act(() => {
      rerender({ value: true, delay: 300 });
    });
    
    act(() => {
      vi.runAllTimers();
    });
    
    expect(result.current).toBe(true);
  });

  it('should handle object values', async () => {
    const initialObj = { name: 'initial' };
    const updatedObj = { name: 'updated' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 300 },
      }
    );

    act(() => {
      rerender({ value: updatedObj, delay: 300 });
    });
    
    act(() => {
      vi.runAllTimers();
    });
    
    expect(result.current).toEqual(updatedObj);
  });

  it('should handle array values', async () => {
    const initialArray = [1, 2, 3];
    const updatedArray = [4, 5, 6];

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialArray, delay: 300 },
      }
    );

    act(() => {
      rerender({ value: updatedArray, delay: 300 });
    });

    act(() => {
      vi.runAllTimers();
    });
    
    expect(result.current).toEqual(updatedArray);
  });

  it('should cleanup timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    rerender({ value: 'updated', delay: 300 });
    unmount();

    // Should have called clearTimeout to cleanup
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should handle delay change', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    act(() => {
      rerender({ value: 'updated', delay: 500 });
    });

    // Should use new delay
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });
});

