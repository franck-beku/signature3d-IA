/**
 * Messagerie — Dashboard Signature 3D IA
 * Communication interne Alain ↔ Franck
 * Version: 2.1 — Thème clair (variables --dash-*)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { Send, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  author: string
  text: string
  time: string
}

export default function MessageriePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [userName, setUserName] = useState('...')
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUserName(JSON.parse(stored).name)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const msg: Message = {
      id: Date.now().toString(),
      author: userName,
      text: input.trim(),
      time: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, msg])
    setInput('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--dash-bg)' }}>

        {/* Header */}
        <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--dash-border)', flexShrink: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'var(--dash-text)', margin: 0 }}>
            Messagerie
          </h1>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
            Alain Dubé · Franck Beku
          </p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'var(--dash-gold-muted)', border: '1px solid var(--dash-gold-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <MessageSquare size={24} style={{ color: 'var(--dash-gold-icon)' }} />
              </div>
              <p style={{ color: 'var(--dash-text-subtle)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Aucun message
              </p>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '13px', lineHeight: 1.6, maxWidth: '280px' }}>
                Commencez la conversation avec votre associé. Les messages sont visibles par Alain et Franck uniquement.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.author === userName
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '10px', alignItems: 'flex-end' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--dash-input)', border: `1px solid ${isMe ? 'var(--dash-gold-ring)' : 'var(--dash-border-input)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', color: isMe ? 'var(--dash-gold)' : 'var(--dash-text-subtle)', fontWeight: 600 }}>
                    {msg.author.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </div>
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ backgroundColor: isMe ? 'var(--dash-gold-muted)' : 'var(--dash-input)', border: `1px solid ${isMe ? 'var(--dash-gold-ring)' : 'var(--dash-border)'}`, borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', fontSize: '13px', color: 'var(--dash-text)', lineHeight: 1.55 }}>
                      {msg.text}
                    </div>
                    <p style={{ color: 'var(--dash-text-muted)', fontSize: '10px', margin: '4px 0 0', textAlign: isMe ? 'right' : 'left' }}>
                      {msg.author.split(' ')[0]} · {msg.time}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 40px 24px', borderTop: '1px solid var(--dash-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--dash-surface)', border: '1px solid var(--dash-border-input)', borderRadius: '12px', padding: '10px 14px' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Écrire un message... (Entrée pour envoyer)"
              rows={1}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--dash-text)', fontSize: '13px', resize: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.5, paddingTop: '2px' }}
            />
            <button onClick={handleSend} disabled={!input.trim()} style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: input.trim() ? 'var(--dash-gold)' : 'var(--dash-border)', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', flexShrink: 0 }}>
              <Send size={13} style={{ color: input.trim() ? '#000' : 'var(--dash-text-muted)' }} />
            </button>
          </div>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '8px', textAlign: 'center' }}>
            Les messages seront sauvegardés après l&apos;intégration du backend.
          </p>
        </div>
      </main>
    </div>
  )
}
