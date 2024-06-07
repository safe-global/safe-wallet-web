import { Box, Button, Grid, Typography } from '@mui/material'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { ChangeThresholdFlow } from '@/components/tx-flow/flows'
import CheckWallet from '@/components/common/CheckWallet'
import { useContext } from 'react'
import { TxModalContext } from '@/components/tx-flow'

export const RequiredConfirmation = ({ threshold, owners }: { threshold: number; owners: number }) => {
  const { setTxFlow } = useContext(TxModalContext)

  return (
    <Box marginTop={6}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Required confirmations
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography pb={2}>Any transaction requires the confirmation of:</Typography>

          <Typography pt={3} pr={2} component="span">
            <b>{threshold}</b> out of <b>{owners}</b> signers.
          </Typography>

          {owners > 1 && (
            <CheckWallet>
              {(isOk) => (
                <Track {...SETTINGS_EVENTS.SETUP.CHANGE_THRESHOLD} as="span">
                  <Button onClick={() => setTxFlow(<ChangeThresholdFlow />)} variant="contained" disabled={!isOk}>
                    Change
                  </Button>
                </Track>
              )}
            </CheckWallet>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
