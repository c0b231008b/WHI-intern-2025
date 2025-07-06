import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
// import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider as CustomThemeProvider } from "../components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "タレントマネジメントシステム",
  description: "シンプルなタレントマネジメントシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* ✅ この1行がクライアントサイドのtitle変更を有効化する */}
        <meta charSet="utf-8" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppRouterCacheProvider>
          <CustomThemeProvider>
            <CssBaseline />
            {children}
          </CustomThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
