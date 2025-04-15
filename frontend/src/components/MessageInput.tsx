import { useState } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  isDisabled?: boolean
  chatId: string
}

export function MessageInput({ onSendMessage, isDisabled = false, chatId }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const { sendMessage } = useWebSocket(`${process.env.REACT_APP_WS_URL}/chat/${chatId}`)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isDisabled) {
      sendMessage({
        type: 'send_message',
        payload: {
          content: message.trim(),
          chatId,
          timestamp: new Date().toISOString(),
        },
      })
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex space-x-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Napište zprávu..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isDisabled}
        />
        <button
          type="submit"
          disabled={isDisabled || !message.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Odeslat
        </button>
      </div>
    </form>
  )
} 