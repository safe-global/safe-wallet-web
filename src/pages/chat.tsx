import { AddFolder } from '@/components/chat/addFolder'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import Members from '@/components/common/Members'
import { useDarkMode } from '@/hooks/useDarkMode'
import { setDarkMode } from '@/store/settingsSlice'
import TransactionHistory from '@/components/common/TransactionHistory'
import TransactionQueue from '@/components/common/TransactionQueue'
import FolderList from '@/components/folder-list'
import FolderGroup from '@/components/folder-list/folderGroups'
import TxListItem from '@/components/transactions/TxListItem'
import TokenTransferModal from '@/components/tx/modals/TokenTransferModal'
import useSafeInfo from '@/hooks/useSafeInfo'
import useTxHistory from '@/hooks/useTxHistory'
import { AppRoutes } from '@/config/routes'
import Link from 'next/link'
import useTxQueue from '@/hooks/useTxQueue'
import useWallet from '@/hooks/wallets/useWallet'
import ellipsisAddress from '@/utils/ellipsisAddress'
import { ArrowBackIos } from '@mui/icons-material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { useAppDispatch } from '@/store'
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  FormControlLabel,
  Switch,
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import ChatNotifications from '@/components/chat/chatNotifications'
import NewTxButton from '@/components/chat/NewTxButton'
import ConnectionCenter from '@/components/common/ConnectWallet/ConnectionCenter'

const SendMessage = dynamic(() => import('@/components/chat/sendMessage'), { ssr: false })

const JoinNoSSR = dynamic(() => import('@/components/chat/join'), { ssr: false })

const CometChatLoginNoSSR = dynamic(() => import('@/components/chat/login'), { ssr: false })

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const drawerWidth = 340

const Main = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
}))

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

const Chat = () => {
  const dispatch = useAppDispatch()
  const isDarkMode = useDarkMode()
  const [folders, setFolders] = useState([])
  const [popup, togglePopup] = useState<boolean>(false)
  const [open, setOpen] = useState(true)
  const [value, setValue] = React.useState(0)
  const [mobileValue, setMobileValue] = React.useState(0)
  const wallet = useWallet()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([''])
  const connectWallet = useConnectWallet()
  const [chatData, setChatData] = useState<any[]>([''])
  const txHistory = useTxHistory()
  const txQueue = useTxQueue()
  const [group, setGroup] = useState<any>()
  const [currentUser, setCurrentUser] = useState<any>()
  const { safe, safeAddress } = useSafeInfo()
  console.log('test', isDarkMode)
  const [ownerStatus, setOwnerStatus] = useState<boolean>()
  const [send, setSend] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)
  const owners = safe?.owners || ['']
  const ownerArray = owners.map((owner) => owner.value)

  const scrollToBottom = useCallback(() => {
    if (!bottom.current) return
    const { current: bottomOfChat } = bottom
    const rect = bottomOfChat.getBoundingClientRect()
    if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
      return
    }
    bottomOfChat.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const activeFolders = async () => {
      const items = JSON.parse(localStorage.getItem('folders')!)
      // const myArray = items.split(",");
      if (items) {
        setFolders(items)
      }
    }
    activeFolders()
    window.addEventListener('storage', activeFolders)
    return () => {
      window.removeEventListener('storage', activeFolders)
    }
  }, [])

  useEffect(() => {
    let isOwnerArr: any[] = []
    if (owners && wallet?.address) {
      owners.map((owner) => {
        if (owner.value == wallet.address) {
          isOwnerArr.push(wallet.address)
        }
      })
      isOwnerArr.length > 0 ? setOwnerStatus(true) : setOwnerStatus(false)
    }
  }, [owners, wallet])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  const handleMobileChange = (event: React.SyntheticEvent, newValue: number) => {
    setMobileValue(newValue)
  }
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }

    setOpen(open)
  }

  const getLast5Items = (arr: any) => {
    if (arr) {
      return arr.length > 5 ? arr.slice(Math.max(arr.length - 5, 0)) : arr
    }
    return arr
  }

  const getChat = useCallback(() => {
    let allData: any[] = []
    const historyItems = getLast5Items(txHistory.page?.results)
    const queueItems = getLast5Items(txQueue?.page?.results)
    historyItems?.forEach((tx: any) => {
      if (tx.type === 'DATE_LABEL') {
        return
      }
      allData.push({
        data: tx,
        timestamp: tx.transaction.timestamp,
        type: 'tx',
      })
    })
    queueItems?.forEach((tx: any) => {
      if (tx.type === 'LABEL') {
        return
      }
      allData.push({
        data: tx,
        timestamp: tx.transaction.timestamp,
        type: 'tx',
      })
    })
    if (!messages.length) {
      setChatData(allData)
      return
    }
    messages?.forEach((message: any) => {
      allData.push({
        data: message,
        timestamp: +message.sentAt * 1000,
        type: 'message',
      })
    })
    allData.sort(function (a, b) {
      if (a['timestamp'] > b['timestamp']) {
        return 1
      } else if (a['timestamp'] < b['timestamp']) {
        return -1
      } else {
        return 0
      }
    })
    setChatData(allData)
  }, [messages, txHistory?.page?.results, txQueue?.page?.results])

  useEffect(() => {
    if (safeAddress) {
      getChat()
    }
  }, [safeAddress, messages, txHistory?.page?.results, txQueue?.page?.results])

  useEffect(() => {
    scrollToBottom()
  }, [chatData, bottom.current])

  if (!wallet?.address)
    return (
      <Container fixed sx={{ height: '100vh', width: '100vw' }}>
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <Typography variant="h4">You are not connected.</Typography>
          <ConnectionCenter />
        </Box>
      </Container>
    )

  if (!ownerArray.includes(wallet?.address!))
    return (
      <Container fixed sx={{ height: '100vh', width: '100vw' }}>
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <Typography variant="h4">You are not a signer on this safe.</Typography>
          <Link href={{ pathname: AppRoutes.home, query: { safe: `${safeAddress}` } }}>
            <Button variant="contained">Go Back</Button>
          </Link>
        </Box>
      </Container>
    )

  if (!currentUser) {
    return <CometChatLoginNoSSR setCurrentUser={setCurrentUser} />
  }

  if (!group) {
    return <JoinNoSSR user={currentUser} setGroup={setGroup} setMessages={setMessages} />
  }

  return (
    <>
      {/*Pop up, TODO: fix this shit to use real styled stuff*/}
      {popup ? <AddFolder togglePopup={togglePopup} /> : ''}
      <Head>
        <title>Safe &mdash; Chat</title>
      </Head>
      <Box sx={{ display: 'flex' }}>
        <Hidden mdDown>
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                bgcolor: 'background.paper',
                boxSizing: 'border-box',
              },
            }}
            variant="permanent"
            anchor="left"
          >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 500 }}>Decentra</Typography>
              <IconButton aria-label="add folder" onClick={() => togglePopup(!popup)}>
                <AddIcon />
              </IconButton>
              {/* TODO: MOVE THIS INFO MINI COMPONENT and make it into a column sidebar*/}
              <FormControlLabel
                control={<Switch checked={isDarkMode} onChange={(_, checked) => dispatch(setDarkMode(checked))} />}
                label="Dark mode"
              />
              <Link href={{ pathname: AppRoutes.settings.index, query: { safe: `${safeAddress}` } }}>
                <SettingsIcon />
              </Link>
            </Toolbar>
            <Divider />
            <ChatNotifications />
            <Box sx={{ width: '100%', height: '100%' }}>
              {/*@ts-ignore*/}
              <Tabs value={value} onChange={handleChange} aria-label="folder tabs">
                <Tab label="All" {...a11yProps(0)} />
                {folders.map((folder, i) => {
                  return <Tab label={folder} key={`${folder}-${i}`} />
                })}
                {/* <Tab label="Ricochet-related" {...a11yProps(1)} />
                <Tab label="Company multisigs" {...a11yProps(2)} /> */}
              </Tabs>
              <TabPanel value={value} index={0}>
                <FolderList />
              </TabPanel>
              {folders.map((folder, i) => {
                return (
                  <TabPanel value={value} index={i + 1} key={`${folder}-${i}`}>
                    <FolderGroup group={folder} />
                  </TabPanel>
                )
              })}
            </Box>
            <Divider />
            <Box sx={{ width: '100%', display: 'flex', gap: '16px', pt: 2, px: 3 }}>
              {wallet ? (
                <>
                  <Avatar alt="Daniel from Decentra" />
                  <Box>
                    <Typography sx={{ fontWeight: 500 }}>From {ellipsisAddress(`${safeAddress}`)}</Typography>
                    <Typography sx={{ color: grey[600] }} paragraph>
                      {ellipsisAddress(`${wallet.address}`)}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Button onClick={connectWallet}>
                  <Typography sx={{ color: grey[600] }} paragraph>
                    Connect Wallet
                  </Typography>
                </Button>
              )}
            </Box>
          </Drawer>
        </Hidden>
        <Main open={open} sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
          <Toolbar
            sx={{
              display: 'flex',
              position: 'sticky',
              zIndex: 1,
              top: 0,
              px: 3,
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'background.default',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
              <Link href={{ pathname: AppRoutes.home, query: { safe: `${safeAddress}` } }}>
                <IconButton aria-label="back">
                  <ArrowBackIos />
                </IconButton>
              </Link>
              <Avatar alt="Decentra" />
              <Typography variant="h6" component="h6">
                Treasury Chat
              </Typography>
            </Box>
            <Hidden mdDown>
              <IconButton onClick={toggleDrawer(!open)}>
                {open ? <CloseIcon aria-label="close sidebar" /> : <ViewSidebarIcon aria-label="show sidebar" />}
              </IconButton>
            </Hidden>
          </Toolbar>
          <Divider />
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
                        The timeline shows all your chat, transactions and events in one place. Only members of this
                        group can see the chat. Say hi!
                      </Typography>
                      <Typography sx={{ fontStyle: 'italic', fontSize: '12px' }} paragraph>
                        Safe created on 5 March 2023 at 19:34:53 CET
                      </Typography>
                    </StyledAlert>
                    <Typography sx={{ fontWeight: 500 }}>Thursday, 9 March 2023</Typography>
                    <List>
                      {chatData.map((chat, index) => {
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
                    <Box ref={bottom} sx={{ height: 0 }}></Box>
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
        </Main>
        <Hidden mdDown>
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                bgcolor: 'background.default',
                boxSizing: 'border-box',
              },
            }}
            variant="persistent"
            anchor="right"
            open={open}
          >
            <Toolbar>
              <Typography sx={{ fontWeight: 500 }}>Overview</Typography>
            </Toolbar>
            <Divider />
            <Box
              sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '40px', pt: 3, px: 3 }}
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
              sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '40px', pt: 3, px: 3 }}
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
              <Box sx={{ bgcolor: 'background.default' }}>
                <Link
                  href={{ pathname: AppRoutes.balances.nfts, query: { safe: `${safeAddress}` } }}
                  key={`${safe}`}
                  passHref
                >
                  <Button variant="outlined" sx={{ mb: 2 }} fullWidth>
                    View Assets
                  </Button>
                </Link>
                <NewTxButton />
              </Box>
            </Box>
          </Drawer>
        </Hidden>
        {send ?? (
          <TokenTransferModal
            onClose={() => setSend(false)}
            initialData={[{ tokenAddress: '0xcaa7349cea390f89641fe306d93591f87595dc1f' }]}
          />
        )}
      </Box>
    </>
  )
}

export default React.memo(Chat)
