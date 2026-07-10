import "./globals.css";
import { ThemeProvider } from "@/components/providers/themeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="km">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
