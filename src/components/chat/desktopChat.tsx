import { Hidden } from '@mui/material'
import React from 'react'
import { ChatSection } from './chatSection'

export const DesktopChat: React.FC<{
  chatData: any[]
  message: string
  messages: string[]
  currentUser: any
  setCurrentUser: any
  setGroup: any
  setMessage: any
  setMessages: any
  bottom: any
  group: any
}> = ({ chatData, message, setMessage, messages, setMessages, bottom, setCurrentUser, currentUser, setGroup, group}) => {
  return (
    <Hidden mdDown>
      <ChatSection
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        group={group}
        setGroup={setGroup}
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
