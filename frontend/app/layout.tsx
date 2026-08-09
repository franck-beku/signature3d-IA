import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
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

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Signature Immersion | Visites 3D & 360° augmentées par l'IA",
  description: "Signature Immersion transforme vos espaces en expériences immersives 3D et 360°, enrichies par Luxedia, votre assistante IA disponible 24/7.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}>
      <body style={{
        backgroundColor: '#FFFFFF',
        color: '#1A1400',
        minHeight: '100vh',
        fontFamily: 'var(--font-inter), sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <LanguageProvider>
          {children}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              pointerEvents: 'none',
              opacity: 0.032,
            }}
          >
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <filter id="grain">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.65"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#grain)" />
            </svg>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}