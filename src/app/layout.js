// app/layout.js

import {
  Noto_Sans_Khmer,
  Kantumruy_Pro,
  Battambang,
  Moul,
} from "next/font/google";

import { ThemeProvider } from "@/components/providers/themeProvider";
import "./globals.css";

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-khmer",
  display: "swap",
});

const battambang = Battambang({
  subsets: ["khmer", "latin"],
  weight: ["400", "700"],
  variable: "--font-battambang",
  display: "swap",
});

const moul = Moul({
  subsets: ["khmer"],
  weight: "400",
  variable: "--font-moul",
  display: "swap",
});

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kantumruy-pro",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="km" suppressHydrationWarning>
      <body
        className={`
          ${kantumruyPro.className}
          ${kantumruyPro.variable}
          ${notoSansKhmer.variable}
          ${battambang.variable}
          ${moul.variable}
        `}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}