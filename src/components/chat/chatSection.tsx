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
import dynamic from 'next/dynamic'
import React from 'react'
import TxListItem from '../transactions/TxListItem'

const SendMessage = dynamic(() => import('@/components/chat/sendMessage'), { ssr: false })

export const ChatSection: React.FC<{
  chatData: any[]
  message: string
  messages: string[]
  setMessage: any
  setMessages: any
  bottom: any
}> = ({ chatData, message, setMessage, messages, setMessages, bottom }) => {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: '100%', overflowY: 'auto' }}>
        <Box
          sx={{
            flex: '1 0 auto',
            display: 'flex',
            height: '100%',
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
                } else {
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
        }}
      >
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
      </Box>
    </Box>
  )
}
