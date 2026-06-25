interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  botMsgColor?: string
  userMsgColor?: string
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
        {content}
      </div>
    </div>
  )
}
