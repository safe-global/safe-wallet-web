import SettingsHeader from '@/components/settings/SettingsHeader'
import { Paper, Grid, Typography, Tooltip, SvgIcon, Button } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import ImportAllDialog from '@/components/settings/ImportAllDialog'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import Track from '@/components/common/Track'

const Data: NextPage = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Head>
        <title>Safe – Settings – Data</title>
      </Head>

      <SettingsHeader />

      <main>
        <Paper sx={{ p: 4, mb: 2 }}>
          <Grid container spacing={3}>
            <Grid item sm={4} xs={12}>
              <Typography variant="h4" fontWeight={700}>
                Data import
                <Tooltip
                  placement="top"
                  title="The data import will overwrite all added Safes and all address book entries"
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
              <Track {...SETTINGS_EVENTS.DATA.IMPORT_ALL}>
                <Button size="small" variant="contained" onClick={() => setModalOpen(true)}>
                  Import all data
                </Button>
              </Track>

              {modalOpen && <ImportAllDialog handleClose={() => setModalOpen(false)} />}
            </Grid>
          </Grid>
        </Paper>
      </main>
    </>
  )
}

export default Data
