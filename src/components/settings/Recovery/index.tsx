import { Box, Button, Chip, Grid, Paper, Typography } from '@mui/material'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import { EnableRecoveryFlow } from '@/components/tx-flow/flows/EnableRecovery'
import { TxModalContext } from '@/components/tx-flow'
import { useDarkMode } from '@/hooks/useDarkMode'
import { RecoverAccountFlow } from '@/components/tx-flow/flows/RecoverAccount'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppSelector } from '@/store'
import { selectRecoveryByGuardian } from '@/store/recoverySlice'

export function Recovery(): ReactElement {
  const { setTxFlow } = useContext(TxModalContext)
  const isDarkMode = useDarkMode()
  const wallet = useWallet()
  const recovery = useAppSelector((state) => selectRecoveryByGuardian(state, wallet?.address ?? ''))

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="h4" fontWeight="bold">
              Account recovery
            </Typography>

            {/* TODO: Extract when widget is merged https://github.com/safe-global/safe-wallet-web/pull/2768  */}
            <Chip
              label="New"
              color={isDarkMode ? 'primary' : 'secondary'}
              size="small"
              sx={{ borderRadius: '4px', fontSize: '12px' }}
            />
          </Box>
        </Grid>

        <Grid item xs>
          <Typography mb={3}>
            Choose a trusted guardian to recover your Safe Account, in case you should ever lose access to your Account.
            Enabling the Account recovery module will require a transactions.
          </Typography>

          {recovery ? (
            // TODO: Move to correct location when widget is ready
            <Button variant="contained" onClick={() => setTxFlow(<RecoverAccountFlow />)}>
              Propose recovery
            </Button>
          ) : (
            <Button variant="contained" onClick={() => setTxFlow(<EnableRecoveryFlow />)}>
              Set up recovery
            </Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}
