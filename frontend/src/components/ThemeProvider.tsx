"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    // ローカルストレージからダークモード設定を読み込み
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    if (savedMode && (savedMode === "light" || savedMode === "dark")) {
      setMode(savedMode);
    } else {
      // システム設定を確認
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#005bac" : "#64b5f6",
      },
      secondary: {
        main: mode === "light" ? "#5ec2c6" : "#81c784",
      },
      background: {
        default: mode === "light" ? "#fafafa" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
    },
    typography: {
      fontFamily: "var(--font-geist-sans), sans-serif",
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
} 