import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type FontSize = "small" | "medium" | "large";

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  questionTextClass: string;
  optionTextClass: string;
}

const sizeMap: Record<FontSize, { question: string; option: string }> = {
  small:  { question: "text-base sm:text-lg",   option: "text-sm sm:text-base" },
  medium: { question: "text-lg sm:text-xl",     option: "text-base sm:text-lg" },
  large:  { question: "text-xl sm:text-2xl",    option: "text-lg sm:text-xl"   },
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
