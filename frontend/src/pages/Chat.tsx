import { useEffect, useState } from 'react'
import { ChatList } from '../components/ChatList'
import { ChatWindow } from '../components/ChatWindow'
import { MessageInput } from '../components/MessageInput'
import { useAuth } from '../hooks/useAuth'
import { useWebSocket } from '../hooks/useWebSocket'

export function Chat() {
  const { user } = useAuth()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { onMessage, onConnected, onDisconnected, onError } = useWebSocket(
    `${process.env.REACT_APP_WS_URL}/user/${user?.id}`
  )

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat)
    }
  }, [selectedChat])

  useEffect(() => {
    const unsubscribeMessage = onMessage((message) => {
      if (message.type === 'new_message' && message.payload.chatId === selectedChat) {
        setMessages((prev) => [...prev, message.payload])
      }
    })

    const unsubscribeConnected = onConnected(() => {
      console.log('WebSocket připojeno')
    })

    const unsubscribeDisconnected = onDisconnected(() => {
      console.log('WebSocket odpojeno')
    })

    const unsubscribeError = onError((error) => {
      console.error('WebSocket chyba:', error)
    })

    return () => {
      unsubscribeMessage()
      unsubscribeConnected()
      unsubscribeDisconnected()
      unsubscribeError()
    }
  }, [onMessage, onConnected, onDisconnected, onError, selectedChat])

  const loadMessages = async (chatId: string) => {
    setIsLoading(true)
    try {
      // TODO: Implementovat načítání zpráv z API
      setMessages([])
    } catch (error) {
      console.error('Chyba při načítání zpráv:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedChat || !content.trim()) return

    try {
      // TODO: Implementovat odesílání zprávy přes API
      const newMessage = {
        id: Date.now().toString(),
        content,
        sender: user?.id,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, newMessage])
    } catch (error) {
      console.error('Chyba při odesílání zprávy:', error)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/4 border-r border-gray-200">
        <ChatList onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </div>
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ChatWindow messages={messages} isLoading={isLoading} chatId={selectedChat} />
            <MessageInput onSendMessage={handleSendMessage} chatId={selectedChat} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Vyberte konverzaci pro zahájení chatu
          </div>
        )}
      </div>
    </div>
  )
} 