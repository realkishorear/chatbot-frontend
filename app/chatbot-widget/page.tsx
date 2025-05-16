'use client'

import dynamic from 'next/dynamic'

const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false })

export default function ChatbotWidget() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-white">
      <Chatbot />
    </div>
  )
}
