import { useEffect, useState } from 'react'

interface ChatListProps {
  onSelectChat: (chatId: string) => void
  selectedChat: string | null
}

export function ChatList({ onSelectChat, selectedChat }: ChatListProps) {
  const [chats, setChats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    setIsLoading(true)
    try {
      // TODO: Implementovat načítání konverzací z API
      setChats([])
    } catch (error) {
      console.error('Chyba při načítání konverzací:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Konverzace</h2>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedChat === chat.id ? 'bg-gray-100' : ''
                }`}
            >
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {chat.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <p className="text-xs text-gray-500">
                    {new Date(chat.lastMessageTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 