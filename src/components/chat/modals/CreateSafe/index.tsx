import ModalDialog from '@/components/common/ModalDialog'
import Open from '@/pages/new-safe/create'
import Load from '@/pages/new-safe/load'
import React, { useState } from 'react'
import {
  DialogContent,
  Tab,
  Tabs,
  Box,
  Typography
} from '@mui/material'

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


const ViewCreateSafe: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  const [tab, setTab] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  return (
    <ModalDialog open={open} dialogTitle="Add Safe" onClose={onClose} maxWidth="md">
      <DialogContent sx={{ maxHeight: '90vh', overflow: 'auto' }}>
        <Tabs value={tab} onChange={handleChange} aria-label="folder tabs">
          <Tab label="Load" />
          <Tab label="Create" />
        </Tabs>
        <TabPanel value={tab} index={1}>
          <Open />
        </TabPanel>
        <TabPanel value={tab} index={0}>
          <Load />
        </TabPanel>
      </DialogContent>
    </ModalDialog>
  )
}

export default ViewCreateSafe