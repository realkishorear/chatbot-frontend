import { Message } from '@/lib/types'
import MenuPanel from './MenuPanel'

export default function MessageBubble({
  message,
  onMenuSubmit,
}: {
  message: Message
  onMenuSubmit?: (data: any) => void
}) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs p-3 rounded-lg text-sm ${isUser
            ? 'bg-blue-500 text-white'
            : message.type === 'menu'
              ? 'bg-white border'
              : 'bg-gray-200 text-black'
          }`}
      >
        {message.type === 'menu' ? (
          <MenuPanel onSubmit={onMenuSubmit || (() => { })} />
        ) : (
          <>
            <p>{message.content}</p>
            {message.timestamp && (
              <p className={`text-[10px] mt-1 opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
                {message.timestamp}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
