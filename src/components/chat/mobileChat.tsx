import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { Box, Hidden, Tab, Tabs, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import React from 'react'
import { ChatOverview } from './chatOverview'
import { ChatSection } from './chatSection'

const SendMessage = dynamic(() => import('@/components/chat/sendMessage'), { ssr: false })

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

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
          <ChatSection
            message={message}
            setMessage={setMessage}
            messages={messages}
            setMessages={setMessages}
            bottom={bottom}
            chatData={chatData}
          />
        </TabPanel>
        <TabPanel value={mobileValue} index={1}>
          <Box height="100%">
            <ChatOverview owners={owners} />
          </Box>
        </TabPanel>
      </Box>
    </Hidden>
  )
}
