import { useState } from 'react'
import { Paper, Grid, Typography, Button, Link } from '@mui/material'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics'
import ImportAllDialog from '../ImportAllDialog'

const DataManagement = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Paper sx={{ p: 4, mb: 2 }}>
      <Grid container spacing={3}>
        <Grid item sm={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Data import
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography>
            You can export your data from the{' '}
            <Link target="_blank" href="https://gnosis-safe.io/app/export">
              old app
            </Link>
            .
          </Typography>

          <Typography mb={3}>The imported data will overwrite all added Safes and all address book entries.</Typography>

          <Track {...SETTINGS_EVENTS.DATA.IMPORT_ALL_BUTTON}>
            <Button size="small" variant="contained" onClick={() => setModalOpen(true)}>
              Import all data
            </Button>
          </Track>

          {modalOpen && <ImportAllDialog handleClose={() => setModalOpen(false)} />}
        </Grid>
      </Grid>
    </Paper>
  )
}

export default DataManagement
