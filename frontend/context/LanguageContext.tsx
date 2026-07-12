/**
 * LanguageContext — Contexte de langue pour le site vitrine
 * Permet de partager FR/EN entre Navbar, Hero, Sections, Footer
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'fr' | 'en'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (fr: string, en: string) => string
}

const STORAGE_KEY = 'signature-immersion-lang'

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (fr) => fr,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('fr')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') {
      setLangState(stored)
    }
  }, [])

  const setLang = (next: Language) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
