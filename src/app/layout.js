import { Kantumruy_Pro } from "next/font/google";

import { ThemeProvider } from "@/components/providers/themeProvider";
import { AuthProvider } from "@/context/AuthContext";

import "./globals.css";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kantumruy",
});

export const metadata = {
  title: "សមាគមយុវជនកម្ពុជា",
  description:
    "កម្មវិធីគ្រប់គ្រងសមាគមយុវជនកម្ពុជា",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="km"
      className={kantumruyPro.variable}
    >
      <body className={kantumruyPro.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}