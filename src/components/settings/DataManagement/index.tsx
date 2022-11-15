import InfoIcon from '@/public/images/notifications/info.svg'

import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { Paper, Grid, Typography, Tooltip, SvgIcon, Button } from '@mui/material'
import { useState } from 'react'
import ImportAllDialog from '../ImportAllDialog'
import { getPersistedState } from '@/store'
import { SAFE_EXPORT_VERSION } from '../ImportAllDialog/useGlobalImportFileParser'
import { pendingTxsSlice } from '@/store/pendingTxsSlice'
import { cookiesSlice } from '@/store/cookiesSlice'

const handleExport = () => {
  const filename = `safe-data-${new Date().toISOString().slice(0, 10)}.json`

  // Exclude pending transactions and cookie consent from export
  const { [pendingTxsSlice.name]: _p, [cookiesSlice.name]: _c, ...exportData } = getPersistedState()

  const data = JSON.stringify({ version: SAFE_EXPORT_VERSION.V2, data: exportData })

  const blob = new Blob([data], { type: 'text/json' })
  const link = document.createElement('a')

  link.download = filename
  link.href = window.URL.createObjectURL(blob)
  link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
  link.dispatchEvent(new MouseEvent('click'))
}

const InfoTooltip = ({ title }: { title: string }) => {
  return (
    <Tooltip placement="top" title={title}>
      <span>
        <SvgIcon
          component={InfoIcon}
          inheritViewBox
          fontSize="small"
          color="border"
          sx={{ verticalAlign: 'middle', ml: 0.5 }}
        />
      </span>
    </Tooltip>
  )
}

const DataManagement = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Export all data{' '}
              <InfoTooltip title="The export includes all added/defaults Safes, address book entries and settings" />
            </Typography>
          </Grid>
          <Grid item lg={8}>
            <Track {...SETTINGS_EVENTS.DATA.EXPORT_ALL_BUTTON}>
              <Button size="small" variant="contained" onClick={handleExport}>
                Export
              </Button>
            </Track>
          </Grid>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Import all data{' '}
              <InfoTooltip title="The imported data will overwrite all added Safes and all address book entries" />
            </Typography>
          </Grid>
          <Grid item lg={8}>
            <Track {...SETTINGS_EVENTS.DATA.IMPORT_ALL_BUTTON}>
              <Button size="small" variant="contained" onClick={() => setModalOpen(true)}>
                Import
              </Button>
            </Track>
          </Grid>
        </Grid>
      </Paper>
      {modalOpen && <ImportAllDialog handleClose={() => setModalOpen(false)} />}
    </>
  )
}

export default DataManagement
