"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { useTimezone } from "@/contexts/timezone-context";
import { parseCommand, getSuggestions } from "@/lib/command-parser";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { MAX_TIMEZONES } from "@/lib/url-parsers";

interface CommandInputProps {
  className?: string;
}

// Placeholder examples (constant, defined outside component)
const PLACEHOLDER_EXAMPLES = [
  "Try \"New York timezone\" or \"Compare Tokyo with London\"",
  "Ask \"What's the time in Paris?\" or \"Sydney vs Dubai\"",
  "Type \"Add Singapore\" or \"London and Berlin timezones\"",
  "Enter \"Show Los Angeles time\" or \"India vs California\"",
] as const;

export function CommandInput({ className }: CommandInputProps) {
  const { 
    addTimezone, 
    removeTimezone, 
    timezoneDisplays,
    reorderTimezones 
  } = useTimezone();
  
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const placeholderIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<Array<{
    name: string;
    timezone: string;
    type: 'city' | 'country' | 'timezone';
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // Debounce input for search suggestions (200ms delay)
  const debouncedInput = useDebounce(input, 200);

  // Pre-initialize search index in background on mount
  useEffect(() => {
    import('@/lib/command-parser').then(({ preInitializeSearchIndex }) => {
      preInitializeSearchIndex();
    });
  }, []);

  // Rotate placeholder only when input is empty
  useEffect(() => {
    // Clear existing interval
    if (placeholderIntervalRef.current) {
      clearInterval(placeholderIntervalRef.current);
    }

    // Only set up rotation if input is empty
    if (!input.trim()) {
      placeholderIntervalRef.current = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
      }, 5000);
    }

    return () => {
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current);
      }
    };
  }, [input]);
  
  // Update suggestions with debounced input (only searches after user stops typing)
  useEffect(() => {
    if (debouncedInput.length >= 2) {
      try {
        const newSuggestions = getSuggestions(debouncedInput, 5);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
        setSelectedSuggestionIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Silently fail - suggestions are optional
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedInput]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current);
      }
    };
  }, []);

  const executeCommand = useCallback(async () => {
    if (!input.trim() || isProcessing) return;
    
    // Clear any existing error
    setError(null);
    
    // Validate input length (prevent extremely long inputs)
    if (input.length > 200) {
      setError("Input is too long. Please keep queries under 200 characters.");
      return;
    }
    
    setIsProcessing(true);
    setShowSuggestions(false);
    
    try {
      const intent = parseCommand(input.trim());
      
      switch (intent.type) {
        case 'add':
          if (intent.timezones.length === 0) {
            setError("I couldn't find that location. Try: 'New York timezone' or 'Show Paris time'");
            break;
          }
          
          // Check if adding would exceed the limit
          const timezonesToAdd = intent.timezones.filter(
            tz => !timezoneDisplays.some(td => td.timezone.id === tz)
          );
          if (timezoneDisplays.length + timezonesToAdd.length > MAX_TIMEZONES) {
            setError(`Maximum of ${MAX_TIMEZONES} timezones allowed. Remove some timezones first.`);
            break;
          }
          
          // Add timezones silently - visual feedback is enough (timezone appears in list)
          for (const timezone of intent.timezones) {
            // Check if already exists
            if (!timezoneDisplays.some(td => td.timezone.id === timezone)) {
              addTimezone(timezone);
            }
          }
          // Clear input and error on success
          setError(null);
          setInput("");
          break;
          
        case 'compare':
          if (intent.timezones.length < 2) {
            setError("Please specify two locations to compare. Try: 'Compare Tokyo with London'");
            break;
          }
          
          const existingIds = timezoneDisplays.map(td => td.timezone.id);
          const newTimezones = intent.timezones.filter(tz => !existingIds.includes(tz));
          
          // Check if adding would exceed the limit
          if (timezoneDisplays.length + newTimezones.length > MAX_TIMEZONES) {
            setError(`Maximum of ${MAX_TIMEZONES} timezones allowed. Remove some timezones first.`);
            break;
          }
          
          // Add new timezones
          for (const timezone of newTimezones) {
            addTimezone(timezone);
          }
          
          // Reorder to put compared timezones first
          const comparedIds = intent.timezones;
          const otherIds = existingIds.filter(id => !comparedIds.includes(id));
          reorderTimezones([...comparedIds, ...otherIds]);
          
          // Clear input and error on success
          setError(null);
          setInput("");
          break;
          
        case 'remove':
          if (intent.timezones.length === 0) {
            setError("I couldn't find that timezone to remove. Try: 'Remove New York'");
            break;
          }
          
          let removedCount = 0;
          for (const timezone of intent.timezones) {
            const display = timezoneDisplays.find(td => td.timezone.id === timezone);
            if (display) {
              removeTimezone(display.timezone.id);
              removedCount++;
            }
          }
          
          // Only show error if nothing was removed
          if (removedCount === 0) {
            setError("Timezone not found");
          } else {
            // Clear input and error on success
            setError(null);
            setInput("");
          }
          break;
          
        case 'clear':
          if (timezoneDisplays.length === 0) {
            // Silent - nothing to clear
            break;
          }
          
          timezoneDisplays.forEach(td => removeTimezone(td.timezone.id));
          // Clear input and error on success
          setError(null);
          setInput("");
          break;
          
        case 'unknown':
          setError("I didn't understand that. Try: 'New York timezone', 'Compare Tokyo with London', or 'Remove Paris'");
          break;
      }
    } catch (err) {
      console.error('Command execution error:', err);
      setError("Something went wrong. Please try again or rephrase your query.");
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, timezoneDisplays, addTimezone, removeTimezone, reorderTimezones]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
      } else if (e.key === 'Tab' || (e.key === 'Enter' && selectedSuggestionIndex >= 0)) {
        e.preventDefault();
        const suggestion = suggestions[selectedSuggestionIndex];
        if (suggestion) {
          setInput(`${suggestion.name} timezone`);
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
      } else if (e.key === 'Enter' && selectedSuggestionIndex === -1) {
        executeCommand();
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
      }
    } else if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const handleFocus = useCallback(() => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = undefined;
    }
    
    // Clear error when input is focused
    if (error) {
      setError(null);
    }
    
    // Show suggestions if we have input
    if (debouncedInput.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [debouncedInput.length, suggestions.length, error]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Check if focus is moving to a suggestion item
    const relatedTarget = e.relatedTarget as HTMLElement;
    const isMovingToSuggestion = relatedTarget?.closest('[role="listbox"]');
    
    if (!isMovingToSuggestion) {
      // Delay hiding suggestions to allow clicks to register
      blurTimeoutRef.current = setTimeout(() => {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }, 200);
    }
  }, []);

  const handleSuggestionClick = useCallback((suggestion: typeof suggestions[0]) => {
    // Clear blur timeout before clicking
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = undefined;
    }
    
    setInput(`${suggestion.name} timezone`);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  }, []);

  const isMobile = className?.includes('mobile-command-input');
  const suggestionsId = 'command-suggestions-list';
  const activeDescendantId = selectedSuggestionIndex >= 0 
    ? `suggestion-${selectedSuggestionIndex}` 
    : undefined;
  
  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div className="relative">
        <div className={cn(
          "relative flex items-center border bg-white dark:bg-stone-900 shadow-sm transition-all duration-200",
          "hover:shadow-md focus-within:shadow-md",
          error 
            ? "border-red-300 dark:border-red-800 focus-within:border-red-400 dark:focus-within:border-red-700" 
            : "border-slate-200 dark:border-stone-700 focus-within:border-slate-300 dark:focus-within:border-stone-600",
          isMobile ? "rounded-xl" : "rounded-2xl"
        )}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              // Sanitize input: limit length (allow spaces, just cap total length)
              const value = e.target.value.slice(0, 200);
              setInput(value);
              
              // Clear error on first keystroke after error
              if (error) {
                setError(null);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
            className={cn(
              "flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-stone-500",
              "text-slate-900 dark:text-stone-100 font-normal caret-slate-900 dark:caret-stone-100",
              "focus:caret-slate-900 dark:focus:caret-stone-100",
              isMobile ? "px-3 py-2.5 pr-10 text-sm" : "px-4 py-3 pr-12 text-sm"
            )}
            disabled={isProcessing}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? suggestionsId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={activeDescendantId}
            aria-invalid={error ? 'true' : undefined}
            aria-label="Command input for timezone queries"
            aria-describedby={error ? "command-error-text" : "command-helper-text"}
          />
          <button
            onClick={executeCommand}
            disabled={!input.trim() || isProcessing}
            className={cn(
              "absolute transition-all duration-200",
              "bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900",
              "hover:bg-slate-800 dark:hover:bg-stone-200",
              "disabled:bg-slate-200 dark:disabled:bg-stone-700 disabled:text-slate-400 dark:disabled:text-stone-500",
              "focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-stone-500 focus:ring-offset-2",
              isMobile ? "right-1.5 p-1.5 rounded-lg" : "right-2 p-2 rounded-lg"
            )}
            aria-label="Execute command"
          >
            <ArrowUp className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            id={suggestionsId}
            role="listbox"
            aria-label="Timezone suggestions"
            className={cn(
              "absolute w-full rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-lg overflow-hidden z-50",
              isMobile ? "bottom-full mb-2" : "top-full mt-2"
            )}
          >
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.timezone}-${suggestion.name}`}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={selectedSuggestionIndex === index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseDown={(e) => {
                    // Prevent blur from firing before click
                    e.preventDefault();
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm transition-colors duration-150",
                    "hover:bg-slate-50 dark:hover:bg-stone-800 focus:bg-slate-50 dark:focus:bg-stone-800 focus:outline-none",
                    selectedSuggestionIndex === index && "bg-slate-50 dark:bg-stone-800",
                    "flex items-center justify-between"
                  )}
                >
                  <div>
                    <span className="font-medium text-slate-900 dark:text-stone-100">{suggestion.name}</span>
                    <span className="ml-2 text-xs text-slate-500 dark:text-stone-400">
                      {suggestion.type === 'city' && 'City'}
                      {suggestion.type === 'country' && 'Country'}
                      {suggestion.type === 'timezone' && 'Timezone'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-stone-500">{suggestion.timezone}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Helper text or Error message */}
      {!isMobile && (
        <div className="mt-2 px-1 min-h-[20px] transition-all duration-200">
          {error ? (
            <p id="command-error-text" className="text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : (
            <p id="command-helper-text" className="text-xs text-slate-500 dark:text-stone-400">
              Ask in natural language • Press Enter to submit
            </p>
          )}
        </div>
      )}
      
      {/* Error message - Mobile */}
      {isMobile && error && (
        <div className="mt-2 px-1 min-h-[20px] transition-all duration-200">
          <p className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
