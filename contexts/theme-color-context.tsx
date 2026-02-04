"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ThemeColorContextType {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  selectedTweakcnTheme: string;
  setSelectedTweakcnTheme: (theme: string) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(
  undefined,
);

export function ThemeColorProvider({ children }: { children: ReactNode }) {
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedTweakcnTheme, setSelectedTweakcnTheme] =
    useState<string>("modern-minimal");

  return (
    <ThemeColorContext.Provider
      value={{
        selectedTheme,
        setSelectedTheme,
        selectedTweakcnTheme,
        setSelectedTweakcnTheme,
      }}
    >
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (context === undefined) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
}
