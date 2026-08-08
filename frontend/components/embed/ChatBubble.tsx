import { Fragment, type ReactNode } from 'react'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  botMsgColor?: string
  userMsgColor?: string
}

// URL (http(s):// ou www.) ou numéro de téléphone (formats nord-américains courants, avec ou
// sans indicatif +).
const LINK_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)|(\+?\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b)/g

/** Découpe une ligne de texte en segments texte/lien cliquable (URL ou tel:), sans jamais injecter de HTML brut. */
function linkifyLine(line: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let i = 0
  LINK_REGEX.lastIndex = 0

  while ((match = LINK_REGEX.exec(line)) !== null) {
    if (match.index > lastIndex) nodes.push(line.slice(lastIndex, match.index))

    const [full, url, phone] = match
    if (url) {
      // Ponctuation de fin de phrase ("...voir https://x.com.") exclue du lien.
      const trimmedUrl = url.replace(/[.,;:!?)]+$/, '')
      const trailingPunct = url.slice(trimmedUrl.length)
      const href = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`
      nodes.push(
        <a key={`${keyPrefix}-${i++}`} href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
          {trimmedUrl}
        </a>
      )
      if (trailingPunct) nodes.push(trailingPunct)
    } else if (phone) {
      const digits = phone.replace(/[^\d+]/g, '')
      nodes.push(
        <a key={`${keyPrefix}-${i++}`} href={`tel:${digits}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
          {phone}
        </a>
      )
    }

    lastIndex = match.index + full.length
  }

  if (lastIndex < line.length) nodes.push(line.slice(lastIndex))
  return nodes
}

/** Rend le contenu d'un message avec liens/téléphones cliquables et retours à la ligne préservés. */
function renderContent(content: string): ReactNode {
  return content.split('\n').map((line, li) => (
    <Fragment key={li}>
      {li > 0 && <br />}
      {linkifyLine(line, `l${li}`)}
    </Fragment>
  ))
}

export default function ChatBubble({ role, content, botMsgColor = '#1a1a1a', userMsgColor = '#d4af37' }: ChatBubbleProps) {
  const isAssistant = role === 'assistant'
  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: isAssistant ? 'flex-start' : 'flex-end' }}>
      <div style={{
        padding: '10px 14px',
        fontSize: '13px',
        lineHeight: 1.6,
        borderRadius: '14px',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        ...(isAssistant ? {
          backgroundColor: botMsgColor,
          color: 'rgba(255,255,255,0.8)',
          borderTopLeftRadius: '4px',
          maxWidth: '90%',
        } : {
          backgroundColor: userMsgColor,
          color: '#000',
          borderTopRightRadius: '4px',
          fontWeight: 500,
          maxWidth: '85%',
        })
      }}>
        {renderContent(content)}
      </div>
    </div>
  )
}
