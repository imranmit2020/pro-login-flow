"use client";

import * as React from "react";
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLightTheme } from "@/hooks/useLightTheme";

export function ThemeToggler() {
  // Use our custom hook that enforces light theme
  useLightTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Light theme (dark mode disabled)"
      onClick={() => {}} // No action needed - always light
      title="Light theme only - dark mode disabled"
      disabled
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all text-yellow-500" />
      <span className="sr-only">Light theme only</span>
    </Button>
  );
}
