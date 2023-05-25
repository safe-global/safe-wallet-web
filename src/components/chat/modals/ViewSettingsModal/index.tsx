import ModalDialog from '@/components/common/ModalDialog'
import React, { useState } from 'react'
import ModulesGroup from '@/components/settings/Modules'
import SafeAppsPermissions from '@/components/settings/SafeAppsPermissions'
import SpendingLimits from '@/components/settings/SpendingLimits'
import DataManagement from '@/components/settings/DataManagement'
import EnvironmentVariables from '@/components/settings/EnvironmentVariables'
import {
  DialogContent,
  Tab,
  Tabs,
  Box,
  Typography
} from '@mui/material'
import AppearanceControl from '@/components/settings/AppearanceControl'
import SetupControl from '@/components/settings/SetupControl'

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
          <Tab label="Setup" />
          <Tab label="Appearance" />
          <Tab label="Modules" />
          <Tab label="Spending limits" />
          <Tab label="Safe Apps permissions" />
          <Tab label="Data" />
          <Tab label="Environment variables" />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <SetupControl />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <AppearanceControl />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <ModulesGroup />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <SpendingLimits />
        </TabPanel>
        <TabPanel value={tab} index={4}>
          <SafeAppsPermissions />
        </TabPanel>
        <TabPanel value={tab} index={5}>
          <DataManagement />
        </TabPanel>
        <TabPanel value={tab} index={6}>
          <EnvironmentVariables />
        </TabPanel>
      </DialogContent>
    </ModalDialog>
  )
}

export default ViewCreateSafe