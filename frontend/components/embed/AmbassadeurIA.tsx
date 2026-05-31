/**
 * AmbassadeurIA — Chatbot Luxedia
 * Version: 4.0 — Avatar image + Multilingue FR/EN + Groq
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import ChatBubble from './ChatBubble'
import SuggestionsRapides from './SuggestionsRapides'
import ActionButtons from './ActionButtons'
import Image from 'next/image'
import { chatApi } from '@/lib/api'

interface Button {
  label: string
  url: string | null
  action: 'link' | 'form' | 'call'
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AmbassadeurIAProps {
  ambassadorName: string
  welcomeMessage: string
  buttons: Button[]
  projectSlug?: string
  language?: 'fr' | 'en'
}

const i18n = {
  fr: {
    online:      'En ligne',
    placeholder: 'Votre question...',
    suggestions: ['Caractéristiques', 'Prix', 'Garantie', 'Disponibilité'],
    errorMsg:    'Je suis désolé, je rencontre une difficulté technique. Veuillez contacter directement notre équipe.',
    fallbackMsg: (text: string) => `Merci pour votre question sur "${text}". Souhaitez-vous être contacté par un conseiller ?`,
  },
  en: {
    online:      'Online',
    placeholder: 'Your question...',
    suggestions: ['Features', 'Price', 'Warranty', 'Availability'],
    errorMsg:    "I'm sorry, I'm experiencing a technical issue. Please contact our team directly.",
    fallbackMsg: (text: string) => `Thank you for your question about "${text}". Would you like to be contacted by an advisor?`,
  },
}

export default function AmbassadeurIA({
  ambassadorName,
  welcomeMessage,
  buttons,
  projectSlug,
  language = 'fr',
}: AmbassadeurIAProps) {
  const [messages, setMessages]         = useState<Message[]>([
    { role: 'assistant', content: welcomeMessage },
  ])
  const [input, setInput]               = useState('')
  const [isTyping, setIsTyping]         = useState(false)
  const [sessionToken, setSessionToken] = useState<string | undefined>()
  const [lang, setLang]                 = useState<'fr' | 'en'>(language)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setLang(language) }, [language])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const currentT = i18n[lang]

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setIsTyping(true)

    try {
      if (projectSlug) {
        const result = await chatApi.sendMessage(text, projectSlug, sessionToken)
        if (result.sessionToken) setSessionToken(result.sessionToken)
        setMessages((prev) => [...prev, { role: 'assistant', content: result.response }])
      } else {
        await new Promise((r) => setTimeout(r, 1200))
        setMessages((prev) => [...prev, { role: 'assistant', content: currentT.fallbackMsg(text) }])
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: currentT.errorMsg }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#111111' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(26,26,26,0.5)', justifyContent: 'space-between' }}>

        {/* ── Avatar Luxedia ── */}
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.3)', flexShrink: 0 }}>
          <Image
            src="/luxedia-avatar.png"
            alt="Luxedia"
            width={36}
            height={36}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ambassadorName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#4ade80', fontSize: '11px' }}>{currentT.online}</span>
          </div>
        </div>

        {/* Sélecteur FR/EN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#1a1a1a', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['fr', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                fontSize: '10px', fontWeight: 600, padding: '3px 8px',
                borderRadius: '4px', border: 'none', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                backgroundColor: lang === l ? '#d4af37' : 'transparent',
                color: lang === l ? '#000' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <Image src="/logo-dark.png" alt="Signature 3D IA" width={60} height={20} style={{ height: '16px', width: 'auto', opacity: 0.5 }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {messages.length === 1 && (
          <SuggestionsRapides suggestions={currentT.suggestions} onSelect={sendMessage} />
        )}

        {isTyping && (
          <div style={{ display: 'flex', gap: '6px', padding: '10px 12px', backgroundColor: '#1a1a1a', borderRadius: '12px', borderTopLeftRadius: '4px', width: 'fit-content' }}>
            {[0, 150, 300].map((delay) => (
              <span key={delay} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.5)', display: 'inline-block', animation: `bounce 1s infinite ${delay}ms` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Action Buttons */}
      <ActionButtons buttons={buttons} projectSlug={projectSlug} />

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(26,26,26,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px 12px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder={currentT.placeholder}
            style={{ flex: 1, background: 'transparent', color: 'white', fontSize: '13px', outline: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: input.trim() && !isTyping ? '#d4af37' : 'rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', flexShrink: 0 }}
          >
            <Send size={12} style={{ color: '#000' }} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  )
}
