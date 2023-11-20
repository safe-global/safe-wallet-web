import { Alert, Box, Button, Chip, Grid, Paper, Typography } from '@mui/material'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import { EnableRecoveryFlow } from '@/components/tx-flow/flows/EnableRecovery'
import { TxModalContext } from '@/components/tx-flow'
import { useDarkMode } from '@/hooks/useDarkMode'
import ExternalLink from '@/components/common/ExternalLink'

export function Recovery(): ReactElement {
  const { setTxFlow } = useContext(TxModalContext)
  const isDarkMode = useDarkMode()

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
          <Typography mb={2}>
            Choose a trusted guardian to recover your Safe Account, in case you should ever lose access to your Account.
            Enabling the Account recovery module will require a transactions.
          </Typography>

          <Alert severity="info">
            Unhappy with the provided option? {/* TODO: Add link */}
            <ExternalLink noIcon href="#">
              Give us feedback
            </ExternalLink>
          </Alert>

          <Button variant="contained" onClick={() => setTxFlow(<EnableRecoveryFlow />)} sx={{ mt: 2 }}>
            Set up recovery
          </Button>
        </Grid>
      </Grid>
    </Paper>
  )
}
