import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

export default function WikiChat() {
  const [apiKey, setApiKey] = useState('')
  const [keySet, setKeySet] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [wikiContext, setWikiContext] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('cultivating-clarity-api-key')
    if (stored) {
      setApiKey(stored)
      setKeySet(true)
    }
  }, [])

  useEffect(() => {
    fetch('/wiki-context.json')
      .then((r) => r.json())
      .then((data) => {
        const ctx = Object.entries(data)
          .map(([name, content]) => `--- ${name} ---\n${content}`)
          .join('\n\n')
        setWikiContext(ctx)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('cultivating-clarity-api-key', apiKey.trim())
      setKeySet(true)
      setShowSettings(false)
    }
  }

  const clearKey = () => {
    localStorage.removeItem('cultivating-clarity-api-key')
    setApiKey('')
    setKeySet(false)
    setShowSettings(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          messages: newMessages,
          wikiContext,
          currentPage: router.pathname,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: `Error: ${data.error}` },
        ])
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.content },
        ])
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `Error: ${err.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      style={{
        borderTop: '1px solid var(--nextra-border-color, #333)',
        marginTop: '1.5rem',
        paddingTop: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            opacity: 0.8,
          }}
        >
          Chat with Wiki
        </span>
        {keySet && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              fontSize: '0.7rem',
              opacity: 0.5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            {showSettings ? 'Close' : 'Settings'}
          </button>
        )}
      </div>

      {showSettings && (
        <div style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={clearKey}
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #666',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            Clear API Key
          </button>
        </div>
      )}

      {!keySet ? (
        <div>
          <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.5rem' }}>
            Enter your Claude API key to chat about the book. The key is stored only in
            your browser.
          </p>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveKey()}
            style={{
              width: '100%',
              padding: '0.4rem 0.5rem',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--nextra-border-color, #333)',
              background: 'transparent',
              color: 'inherit',
              marginBottom: '0.5rem',
              outline: 'none',
            }}
          />
          <button
            onClick={saveKey}
            style={{
              width: '100%',
              padding: '0.4rem',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              background: 'hsl(var(--nextra-primary-hue) 100% 45%)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Save Key
          </button>
        </div>
      ) : (
        <div>
          {/* Messages */}
          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              marginBottom: '0.5rem',
              fontSize: '0.8rem',
              lineHeight: '1.4',
            }}
          >
            {messages.length === 0 && (
              <p style={{ opacity: 0.4, fontSize: '0.75rem', fontStyle: 'italic' }}>
                Ask anything about Cultivating Clarity...
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '0.5rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: '6px',
                  background:
                    msg.role === 'user'
                      ? 'hsla(var(--nextra-primary-hue) 100% 45% / 0.15)'
                      : 'hsla(0 0% 50% / 0.1)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    opacity: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  {msg.role === 'user' ? 'You' : 'Claude'}
                </span>
                <div style={{ marginTop: '0.15rem' }}>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div
                style={{
                  padding: '0.4rem 0.5rem',
                  opacity: 0.5,
                  fontStyle: 'italic',
                  fontSize: '0.75rem',
                }}
              >
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the book..."
              rows={1}
              style={{
                flex: 1,
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--nextra-border-color, #333)',
                background: 'transparent',
                color: 'inherit',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: loading || !input.trim()
                  ? 'hsla(0 0% 50% / 0.3)'
                  : 'hsl(var(--nextra-primary-hue) 100% 45%)',
                color: '#fff',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                fontWeight: 500,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
