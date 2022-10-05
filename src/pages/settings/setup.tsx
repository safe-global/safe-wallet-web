import type { NextPage } from 'next'
import Head from 'next/head'
import { Grid, Paper, Tooltip, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { ContractVersion } from '@/components/settings/ContractVersion'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import useSafeInfo from '@/hooks/useSafeInfo'
import SettingsHeader from '@/components/settings/SettingsHeader'
import useIsGranted from '@/hooks/useIsGranted'

const Setup: NextPage = () => {
  const { safe } = useSafeInfo()
  const nonce = safe.nonce
  const ownerLength = safe.owners.length
  const threshold = safe.threshold
  const isGranted = useIsGranted()

  return (
    <>
      <Head>
        <title>Safe – Settings – Setup</title>
      </Head>

      <SettingsHeader />

      <main>
        <Paper sx={{ p: 4, mb: 2 }}>
          <OwnerList isGranted={isGranted} />
          <RequiredConfirmation threshold={threshold} owners={ownerLength} isGranted={isGranted} />
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item lg={4} xs={12}>
              <Typography variant="h4" fontWeight={700}>
                Safe nonce
                <Tooltip
                  placement="top"
                  title="For security reasons, transactions made with Safe need to be executed in order. The nonce shows you which transaction will be executed next. You can find the nonce for a transaction in the transaction details."
                >
                  <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
                </Tooltip>
              </Typography>

              <Typography pt={1}>
                Current nonce: <b>{nonce}</b>
              </Typography>
            </Grid>

            <Grid item xs>
              <ContractVersion isGranted={isGranted} />
            </Grid>
          </Grid>
        </Paper>
      </main>
    </>
  )
}

export default Setup
