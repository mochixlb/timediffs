"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface TouchInteractionOptions {
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  longPressDelay?: number;
  swipeThreshold?: number;
  preventScroll?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * Comprehensive hook for handling various touch interactions
 * Supports tap, long press, and swipe gestures
 */
export function useTouchInteractions(options: TouchInteractionOptions = {}) {
  const {
    onTap,
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    longPressDelay = 500,
    swipeThreshold = 50,
    preventScroll = false,
  } = options;

  const [isTouching, setIsTouching] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const touchStartRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Haptic feedback support (for supported browsers/devices)
  const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" = "light") => {
    if ("vibrate" in navigator) {
      const duration = type === "light" ? 10 : type === "medium" ? 20 : 30;
      navigator.vibrate(duration);
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      setIsTouching(true);
      setIsLongPress(false);

      // Start long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          setIsLongPress(true);
          triggerHaptic("medium");
          onLongPress();
        }, longPressDelay);
      }

      if (preventScroll) {
        e.preventDefault();
      }
    },
    [onLongPress, longPressDelay, preventScroll, triggerHaptic]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!touchStartRef.current || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Cancel long press if moved too much
      if (distance > 10 && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!touchStartRef.current) return;

      const touchEnd = e.changedTouches[0];
      const deltaX = touchEnd.clientX - touchStartRef.current.x;
      const deltaY = touchEnd.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const timeDiff = Date.now() - touchStartRef.current.time;

      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // Detect swipe gestures
      if (distance > swipeThreshold && timeDiff < 500) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            triggerHaptic("light");
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            triggerHaptic("light");
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            triggerHaptic("light");
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            triggerHaptic("light");
            onSwipeUp();
          }
        }
      } else if (distance < 10 && timeDiff < 200 && !isLongPress && onTap) {
        // Regular tap
        triggerHaptic("light");
        onTap();
      }

      setIsTouching(false);
      setIsLongPress(false);
      touchStartRef.current = null;
    },
    [
      onTap,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      swipeThreshold,
      isLongPress,
      triggerHaptic,
    ]
  );

  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsTouching(false);
    setIsLongPress(false);
    touchStartRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const touchProps = {
    ref: (el: HTMLElement | null) => {
      elementRef.current = el;
    },
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    className: "no-tap-highlight",
  };

  return {
    touchProps,
    isTouching,
    isLongPress,
    triggerHaptic,
  };
}
