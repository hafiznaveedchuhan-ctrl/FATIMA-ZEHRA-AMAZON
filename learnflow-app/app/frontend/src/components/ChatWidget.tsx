'use client'

import { useState, useRef, useEffect } from 'react'
import { chatAPI } from '@/lib/api'
import { useChatStore } from '@/lib/store'
import { auth } from '@/lib/auth'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sessionId, setSessionId } = useChatStore()

  // Initialize session ID and load history
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session-${Date.now()}`)
    }
  }, [])

  // Load chat history when widget opens
  useEffect(() => {
    if (isOpen && sessionId && messages.length === 0) {
      loadChatHistory()
    }
  }, [isOpen, sessionId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory(sessionId, 20, 0)
      if (response.data.messages) {
        setMessages(
          response.data.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }))
        )
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    // Add user message to UI immediately
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const user = auth.getUser()
      const response = await chatAPI.sendMessage(
        input,
        sessionId,
        user?.id
      )

      // Collect streamed response
      let assistantContent = ''
      const reader = response.data.body?.getReader()

      if (reader) {
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const content = line.substring(6)
              if (content !== '[DONE]') {
                assistantContent += content
              }
            }
          }
        }
      }

      // Add assistant message
      if (assistantContent) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = async () => {
    if (confirm('Clear chat history?')) {
      try {
        await chatAPI.clearHistory(sessionId)
        setMessages([])
      } catch (error) {
        console.error('Failed to clear chat:', error)
      }
    }
  }

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition hover:scale-110 duration-200"
        title="Chat with us"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 bg-white rounded-lg shadow-2xl flex flex-col max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="bg-pink-600 text-white px-4 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Fatima Zehra Assistant</h3>
              <p className="text-xs text-pink-100">Chat with our AI</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-lg hover:opacity-80 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <p className="mb-2">👋 Welcome!</p>
                <p>Ask me about our products</p>
                <p>or fashion recommendations</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-pink-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === 'user'
                          ? 'text-pink-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-3 space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-pink-600 text-white px-4 py-2 rounded text-sm hover:bg-pink-700 disabled:bg-gray-300 transition"
              >
                Send
              </button>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="w-full text-xs text-gray-500 hover:text-gray-700 transition"
            >
              Clear chat
            </button>
          </form>
        </div>
      )}
    </>
  )
}
