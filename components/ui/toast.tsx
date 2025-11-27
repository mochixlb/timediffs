"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        "bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-3 rounded-lg shadow-lg",
        "flex items-center gap-3 min-w-[280px] max-w-[90vw]",
        "transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      role="status"
      aria-live="polite"
    >
      <span className="flex-1 text-sm">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="p-1 hover:bg-slate-800 dark:hover:bg-stone-200 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

