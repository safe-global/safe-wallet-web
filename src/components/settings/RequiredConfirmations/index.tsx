import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import { TxModalContext } from '@/components/tx-flow'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useContext } from 'react'

export const RequiredConfirmation = ({ threshold, owners }: { threshold: number; owners: number }) => {
  const { setTxFlow } = useContext(TxModalContext)

  return (
    <Box data-sid="16172" marginTop={6}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Required confirmations
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography>Any transaction requires the confirmation of:</Typography>
          <Typography paddingTop={3}>
            <b>{threshold}</b> out of <b>{owners}</b> owners.
          </Typography>

          {owners > 1 && (
            <Box data-sid="36519" pt={2}>
              <CheckWallet>
                {(isOk) => (
                  <Track {...SETTINGS_EVENTS.SETUP.CHANGE_THRESHOLD}>
                    <Button
                      data-sid="98020"
                      onClick={() => setTxFlow(<ChangeThresholdFlow />)}
                      variant="contained"
                      disabled={!isOk}
                    >
                      Change
                    </Button>
                  </Track>
                )}
              </CheckWallet>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
