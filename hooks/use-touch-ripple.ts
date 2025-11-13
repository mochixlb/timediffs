"use client";

import { useCallback, useRef } from "react";

interface RippleOptions {
  color?: "dark" | "light";
  duration?: number;
  disabled?: boolean;
}

/**
 * Custom hook for adding ripple effects to touch/click interactions
 * Provides visual feedback for user interactions on mobile and desktop
 */
export function useTouchRipple(options: RippleOptions = {}) {
  const { color = "dark", duration = 600, disabled = false } = options;
  const containerRef = useRef<HTMLElement | null>(null);

  const createRipple = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (disabled || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Get coordinates from either mouse or touch event
      let clientX: number, clientY: number;
      if ("touches" in event && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if ("clientX" in event) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else {
        return;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Create ripple element
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - size / 2}px`;
      ripple.style.top = `${y - size / 2}px`;
      
      ripple.className = `ripple-effect ${
        color === "light" ? "ripple-effect-light" : ""
      }`;

      // Add ripple to container
      container.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, duration);
    },
    [color, duration, disabled]
  );

  const rippleProps = {
    ref: (el: HTMLElement | null) => {
      containerRef.current = el;
      // Add ripple container class
      if (el && !disabled) {
        el.classList.add("ripple-container");
      }
    },
    onMouseDown: createRipple,
    onTouchStart: createRipple,
  };

  return { rippleProps, createRipple };
}
