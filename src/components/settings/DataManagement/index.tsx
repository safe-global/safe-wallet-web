import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { Paper, Grid, Typography, Button } from '@mui/material'
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

const DataManagement = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Paper sx={{ p: 4, mb: 2 }}>
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Export all data
            </Typography>
          </Grid>

          <Grid item xs>
            <Typography pb={2}>The export includes all added Safes, address book entries and settings.</Typography>
            <Track {...SETTINGS_EVENTS.DATA.EXPORT_ALL_BUTTON}>
              <Button size="small" variant="contained" onClick={handleExport}>
                Export
              </Button>
            </Track>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Import all data
            </Typography>
          </Grid>

          <Grid item xs>
            <Typography pb={2}>
              The imported data will overwrite all added Safes and all address book entries.
            </Typography>
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
