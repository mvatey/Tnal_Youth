// app/layout.js
<<<<<<< HEAD
import { Kantumruy_Pro } from "next/font/google";
=======

import {
  Noto_Sans_Khmer,
  Kantumruy_Pro,
  Battambang,
  Moul,
} from "next/font/google";
>>>>>>> origin/feature/member

import { ThemeProvider } from "@/components/providers/themeProvider";
import { AuthProvider } from "@/context/AuthContext";

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
<<<<<<< HEAD
  variable: "--font-kantumruy",
=======
  variable: "--font-kantumruy-pro",
  display: "swap",
>>>>>>> origin/feature/member
});

export const metadata = {
  title: "សមាគមយុវជនកម្ពុជា",
  description:
    "កម្មវិធីគ្រប់គ្រងសមាគមយុវជនកម្ពុជា",
};

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