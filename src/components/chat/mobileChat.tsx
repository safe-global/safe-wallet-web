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
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  Button,
  Tabs,
  Tab,
} from '@mui/material'
import dynamic from 'next/dynamic'
import { styled } from '@mui/material/styles'
import TxListItem from '../transactions/TxListItem'
import useSafeInfo from '@/hooks/useSafeInfo'
import TransactionQueue from '../common/TransactionQueue'
import TransactionHistory from '../common/TransactionHistory'
import Members from '../common/Members'
import { grey } from '@mui/material/colors'
import ellipsisAddress from '@/utils/ellipsisAddress'

const SendMessage = dynamic(() => import('@/components/chat/sendMessage'), { ssr: false })

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const StyledAlert = styled(Alert)(() => ({
  backgroundColor: 'hsla(231, 17%, 76%, 0.33)',
}))

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1.5 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

export const MobileChat: React.FC<{
  chatData: any[]
  message: string
  messages: string[]
  setMessage: any
  setMessages: any
  bottom: any
  owners: any[]
}> = ({ chatData, message, setMessage, messages, setMessages, bottom, owners }) => {
  const wallet = useWallet()
  const { safe, safeAddress } = useSafeInfo()
  const [mobileValue, setMobileValue] = React.useState(0)

  const handleMobileChange = (event: React.SyntheticEvent, newValue: number) => {
    setMobileValue(newValue)
  }

  return (
    <Hidden mdUp>
      <Box sx={{ width: '100%', height: '100%' }}>
        <Tabs variant="fullWidth" value={mobileValue} onChange={handleMobileChange} aria-label="responsive tabs">
          <Tab label="Timeline" {...a11yProps(0)} />
          <Tab label="Overview" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={mobileValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                flex: '1 0 auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                alignItems: 'start',
                gap: '16px',
              }}
            >
              <StyledAlert icon={false}>
                <Typography paragraph>This is the beginning of the timeline from this Safe</Typography>
                <Typography paragraph>
                  The timeline shows all your chat, transactions and events in one place. Only members of this group can
                  see the chat. Say hi!
                </Typography>
                <Typography sx={{ fontStyle: 'italic', fontSize: '12px' }} paragraph>
                  Safe created on 5 March 2023 at 19:34:53 CET
                </Typography>
              </StyledAlert>
              <Typography sx={{ fontWeight: 500 }}>Thursday, 9 March 2023</Typography>
              <List>
                {chatData.map((chat, index) => {
                  if (index === chat?.length) {
                    return <div ref={bottom} key={`key`} />
                  }
                  if (chat.type === 'message') {
                    return (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32 }} alt={chat?.data?.sender.uid || ''} />
                        </ListItemIcon>
                        <ListItemText
                          disableTypography
                          sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                          primary={
                            <React.Fragment>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'flex-start',
                                  alignItems: 'center',
                                  gap: '10px',
                                }}
                              >
                                <Typography sx={{ display: 'inline' }} component="span" variant="body2">
                                  {chat.data.sender.name === wallet?.address ? 'You' : chat?.data?.sender.uid}
                                </Typography>
                                <Typography sx={{ display: 'inline' }} component="span" variant="body2">
                                  {chat.timeStamp}
                                </Typography>
                              </Box>
                            </React.Fragment>
                          }
                          secondary={chat.data.text}
                        />
                      </ListItem>
                    )
                  } else {
                    return (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemAvatar sx={{ minWidth: 35, pr: '10px' }}>
                          <Avatar sx={{ width: 32, height: 32 }} alt={chat.name} />
                        </ListItemAvatar>
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
                          secondary={chat.data.text}
                        />
                        <TxListItem key={`${index}-tx`} item={chat?.data} />
                      </ListItem>
                    )
                  }
                })}
                <div ref={bottom} />
              </List>
            </Box>
            <Box sx={{ flexShrink: 0, position: 'sticky', bottom: 0, bgcolor: 'background.default' }}>
              <Divider />
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', py: 2, px: 1 }}>
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
        </TabPanel>
        <TabPanel value={mobileValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                flex: '1 0 auto',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '40px',
                  pt: 3,
                  px: 3,
                }}
              >
                <Typography sx={{ color: grey[500] }}>Network</Typography>
                <Typography>
                  {safe?.chainId === '137'
                    ? 'Matic'
                    : safe?.chainId === '1'
                    ? 'Ethereum'
                    : safe?.chainId === '10'
                    ? 'Optimism'
                    : safe?.chainId === '80001'
                    ? 'Mumbai'
                    : ''}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '40px',
                  pt: 3,
                  px: 3,
                }}
              >
                <Typography sx={{ color: grey[500] }} paragraph>
                  Address
                </Typography>
                <Typography paragraph noWrap>
                  {ellipsisAddress(`${safeAddress}`)}
                </Typography>
              </Box>
              <Divider />
              <Members members={owners} />
              <Divider />
              <TransactionQueue />
              <Divider />
              <TransactionHistory />
              <Divider />
              <Box sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 500 }} paragraph>
                  Assets
                </Typography>
                <Typography paragraph>View all tokens and NFTs the Safe holds.</Typography>
                <Box sx={{ position: 'fixed', bottom: 0, bgcolor: 'background.default' }}>
                  <Button sx={{ mb: 2 }} variant="outlined" fullWidth>
                    Send Tokens
                  </Button>
                  <Button variant="outlined" fullWidth>
                    Send NFTs
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </Box>
    </Hidden>
  )
}
