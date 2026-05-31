import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Signature 3D IA | Immersive Intelligence",
  description: "Transformez vos espaces en expériences 360° et 3D intelligentes. Matterport + IA — disponible 24/7.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${cormorant.variable}`}>
      <body style={{
        backgroundColor: '#FFFFFF',
        color: '#1A1400',
        minHeight: '100vh',
        fontFamily: 'var(--font-inter), sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}