import { Hidden } from '@mui/material'
import dynamic from 'next/dynamic'
import React from 'react'
import { ChatSection } from './chatSection'

const SendMessage = dynamic(() => import('@/components/chat/sendMessage'), { ssr: false })

export const DesktopChat: React.FC<{
  chatData: any[]
  message: string
  messages: string[]
  setMessage: any
  setMessages: any
  bottom: any
}> = ({ chatData, message, setMessage, messages, setMessages, bottom }) => {
  return (
    <Hidden mdDown>
      <ChatSection
        message={message}
        setMessage={setMessage}
        messages={messages}
        setMessages={setMessages}
        bottom={bottom}
        chatData={chatData}
      />
    </Hidden>
  )
}
