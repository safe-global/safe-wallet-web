import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import dynamic from 'next/dynamic'
import React from 'react'
import TxListItem from '../transactions/TxListItem'

const SendMessage = dynamic(() => import('@/components/chat/sendMessage'), { ssr: false })
const LoginButton = dynamic(() => import('@/components/chat/LoginButton'), { ssr: false })
const JoinButton = dynamic(() => import('@/components/chat/JoinButton'), { ssr: false })



export const ChatSection: React.FC<{
  currentUser: any
  setCurrentUser: any
  group: any
  setGroup: any
  chatData: any[]
  message: string
  messages: string[]
  setMessage: any
  setMessages: any
  bottom: any
}> = ({ currentUser, setCurrentUser, group, setGroup, chatData, message, setMessage, messages, setMessages, bottom }) => {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: '100%', overflowY: 'auto' }}>
        <Box
          sx={{
            flex: '1 0 auto',
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            justifyContent: 'start',
            alignItems: 'start',
            gap: '16px',
            p: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Typography sx={{ fontWeight: 500 }}>Thursday, 9 March 2023</Typography>
          <List>
            {chatData &&
              chatData.map((chat, index) => {
                if (chat.type === 'message' && chat?.data?.sender) {
                  return (
                    <ListItem
                      sx={{
                        display: 'flex',
                        alignItems: 'start',
                        borderRadius: '4px',
                        p: 0,
                        mb: 2,
                        width: '100%',
                      }}
                      key={index}
                      alignItems="flex-start"
                    >
                      <ListItemAvatar sx={{ minWidth: 36, pr: '16px' }}>
                        <Avatar sx={{ width: 36, height: 36 }} alt={chat?.data?.sender.uid || ''} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline', pr: '12px', fontWeight: 600 }}
                              component="span"
                            >
                              {chat.data.sender.name === wallet?.address ? 'You' : chat?.data?.sender.uid}
                            </Typography>
                            <Typography sx={{ display: 'inline' }} component="span" variant="body2">
                              {chat.timeStamp}
                            </Typography>
                          </React.Fragment>
                        }
                        secondary={
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                            >
                              {chat.data.text}
                            </Typography>
                        }   
                      />
                    </ListItem>
                  )
                } else if (chat?.type) {
                  return (
                    <ListItem key={index} sx={{ mb: 1 }} alignItems="flex-start" disableGutters>
                      <TxListItem key={`${index}-tx`} item={chat?.data} />
                      <ListItemText
                         primary={
                           <React.Fragment>
                             <Typography
                               sx={{ display: 'inline', pr: '8px', fontWeight: 600 }}
                               component="span"
                               variant="subtitle2"
                             >
                               {chat.name}
                             </Typography>
                             <Typography sx={{ display: 'inline' }} component="span" variant="body2">
                               {chat.timeAgo}
                             </Typography>
                           </React.Fragment>
                         }
                         secondary={chat.message}
                    />
                    </ListItem>
                  )
                }
              })}
            <Box ref={bottom} sx={{ height: 0 }} />
            {!chatData ? <ListItem>No Chat</ListItem> : ''}
          </List>
        </Box>
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0,
          p: 2,
          borderTop: '1px solid',
          borderColor: grey[800],
          pt: 3
        }}
      >
        {currentUser && group ? (
        <Box sx={{ width: '100%', display: 'flex', gap: '16px', p: 3, pt: 0 }}>
          <TextField
            sx={{ flexGrow: 1 }}
            label="Type Something"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <SendMessage
            message={message}
            safeAddress={safeAddress}
            setMessages={setMessages}
            setMessage={setMessage}
            prevState={messages}
          />
        </Box>
        ) : (
          <Box sx={{ border: '1px solid var(--color-border-light)', borderRadius: '6px', p: 3}}>
            <Typography pb={1} fontSize="sm" fontWeight={600}>
             Join the chat
            </Typography>
            <Typography paragraph fontSize="xs">
             To view messages, click the button below
            </Typography>
            {!currentUser ? <LoginButton setCurrentUser={setCurrentUser} /> : currentUser && !group ? <JoinButton user={currentUser} setGroup={setGroup} setMessages={setMessages} /> : ''}
          </Box>
        )}
      </Box>
    </Box>
  )
}
