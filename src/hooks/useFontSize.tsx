import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type FontSize = "small" | "medium" | "large";

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  questionTextClass: string;
  optionTextClass: string;
}

// Fluid sizes using clamp(min, vw-based, max) so they scale smoothly
// between mobile and desktop without any breakpoint jumps.
const sizeMap: Record<FontSize, { question: string; option: string }> = {
  small:  {
    question: "text-[clamp(0.8rem,2.6vw,0.95rem)] leading-snug",
    option:   "text-[clamp(0.75rem,2.3vw,0.85rem)] leading-snug",
  },
  medium: {
    question: "text-[clamp(0.9rem,3vw,1.1rem)] leading-snug",
    option:   "text-[clamp(0.8rem,2.6vw,1rem)] leading-snug",
  },
  large:  {
    question: "text-[clamp(1rem,3.4vw,1.25rem)] leading-snug",
    option:   "text-[clamp(0.9rem,3vw,1.1rem)] leading-snug",
  },
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    return (localStorage.getItem("exam-font-size") as FontSize) || "medium";
  });

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("exam-font-size", size);
  };

  return (
    <FontSizeContext.Provider value={{
      fontSize,
      setFontSize,
      questionTextClass: sizeMap[fontSize].question,
      optionTextClass: sizeMap[fontSize].option,
    }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error("useFontSize must be used within FontSizeProvider");
  return ctx;
}
