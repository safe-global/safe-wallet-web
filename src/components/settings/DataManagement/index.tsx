import InfoIcon from '@/public/images/notifications/info.svg'

import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { Paper, Grid, Typography, Tooltip, SvgIcon, Button } from '@mui/material'
import { useState } from 'react'
import ImportAllDialog from '../ImportAllDialog'

const DataManagement = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Paper sx={{ p: 4, mb: 2 }}>
      <Grid container spacing={3}>
        <Grid item sm={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Data import
            <Tooltip
              placement="top"
              title="The imported data will overwrite all added Safes and all address book entries"
            >
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
          </Typography>
        </Grid>
        <Grid item xs justifyContent="flex-end" display="flex">
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
