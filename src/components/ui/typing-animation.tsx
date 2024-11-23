"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
  pauseDuration?: number; // Duration to pause when text is complete
  clearDuration?: number; // Duration to pause before clearing
}

export default function TypingAnimation({
  text,
  duration = 100,
  className,
  pauseDuration = 1000, // Default 2 second pause when complete
  clearDuration = 500, // Default 1 second pause before clearing
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;

    if (isTyping) {
      // Typing animation
      if (displayedText.length < text.length) {
        timer = setTimeout(() => {
          setDisplayedText(text.substring(0, displayedText.length + 1));
        }, duration);
      } else {
        // Text is complete, pause before clearing
        timer = setTimeout(() => {
          setIsTyping(false);
          setIsClearing(true);
        }, pauseDuration);
      }
    } else if (isClearing) {
      // Clearing animation
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, duration);
      } else {
        // Text is cleared, restart typing
        timer = setTimeout(() => {
          setIsTyping(true);
          setIsClearing(false);
        }, clearDuration);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [displayedText, isTyping, isClearing, text, duration, pauseDuration, clearDuration]);

  return (
    <h1 className={cn("font-display text-left", className)}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </h1>
  );
}
