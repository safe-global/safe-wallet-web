import React from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import {
  Alert,
  Avatar,
  Box,
  Divider,
  Hidden,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import dynamic from 'next/dynamic'
import { styled } from '@mui/material/styles'
import TxListItem from '../transactions/TxListItem'
import useSafeAddress from '@/hooks/useSafeAddress'

const SendMessage = dynamic(() => import('@/components/chat/sendMessage'), { ssr: false })

const StyledAlert = styled(Alert)(() => ({
  backgroundColor: 'hsla(231, 17%, 76%, 0.33)',
}))

export const DesktopChat: React.FC<{
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
    <Hidden mdDown>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ height: '80vh', overflowY: 'auto' }}>
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
              bgcolor: 'background.default',
            }}
          >
            <StyledAlert icon={false}>
              <Typography paragraph>This is the beginning of the timeline from this Safe</Typography>
              <Typography paragraph>
                The timeline shows all your chat, transactions and events in one place. Only members of this group
                can see the chat. Say hi!
              </Typography>
              <Typography sx={{ fontStyle: 'italic', fontSize: '12px' }} paragraph>
                Safe created on 5 March 2023 at 19:34:53 CET
              </Typography>
            </StyledAlert>
            <Typography sx={{ fontWeight: 500 }}>Thursday, 9 March 2023</Typography>
            <List>
              {chatData &&
                chatData.map((chat, index) => {
                  if (chat.type === 'message' && chat?.data?.sender) {
                    return (
                      <ListItem
                        sx={{ display: 'flex', alignItems: 'center' }}
                        key={index}
                        alignItems="flex-start"
                        disableGutters
                      >
                        <ListItemAvatar sx={{ minWidth: 35, pr: '10px' }}>
                          <Avatar sx={{ width: 32, height: 32 }} alt={chat?.data?.sender.uid || ''} />
                        </ListItemAvatar>
                        <ListItemText
                          sx={{ bgcolor: 'background.paper', p: 2, width: '100%' }}
                          style={{ borderRadius: '8px' }}
                          primary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline', pr: '12px', fontWeight: 600 }}
                                component="span"
                                variant="subtitle2"
                              >
                                {chat.data.sender.name === wallet?.address ? 'You' : chat?.data?.sender.uid}
                              </Typography>
                              <Typography sx={{ display: 'inline' }} component="span" variant="body2">
                                {chat.timeStamp}
                              </Typography>
                            </React.Fragment>
                          }
                          secondary={chat.data.text}
                        />
                      </ListItem>
                    )
                  } else {
                    return (
                      <ListItem key={index} alignItems="flex-start" disableGutters>
                        <ListItemAvatar sx={{ minWidth: 35, pr: '10px' }}>
                          <Avatar sx={{ width: 32, height: 32 }} alt={chat.name} />
                        </ListItemAvatar>
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
            height: '12vh',
            flexShrink: 0,
            bgcolor: 'background.default',
          }}
        >
          <Divider />
          <Box sx={{ width: '100%', display: 'flex', gap: '16px', p: 3 }}>
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
    </Hidden>
  )
}
