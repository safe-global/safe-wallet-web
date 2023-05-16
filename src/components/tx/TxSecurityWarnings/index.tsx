import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { type RedefinedModuleResponse } from '@/services/security/modules/RedefineModule'
import { dispatchTxScan, SecurityModuleNames } from '@/services/security/service'
import { List, ListItem, ListItemAvatar, Chip, ListItemText, Grid, Typography } from '@mui/material'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { useEffect, useState } from 'react'

const useRedefine = (safeTx: SafeTransaction | undefined) => {
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()

  const [redefineScanResult, setRedefineScanResult] = useState<RedefinedModuleResponse | undefined>()

  useEffect(() => {
    if (!safeTx || !wallet?.address) {
      return
    }

    const unsubscribe = dispatchTxScan({
      type: SecurityModuleNames.REDEFINE,
      callback: setRedefineScanResult,
      request: {
        chainId: Number(safe.chainId),
        safeTransaction: safeTx,
        safeAddress,
        walletAddress: wallet.address,
        threshold: safe.threshold,
      },
    })

    return () => {
      unsubscribe()
    }
  }, [safe.chainId, safe.threshold, safeAddress, safeTx, wallet?.address])

  return redefineScanResult
}

export const TxSecurityWarnings = ({ safeTx }: { safeTx: SafeTransaction | undefined }) => {
  const redefineScanResult = useRedefine(safeTx)

  return (
    <>
      <List>
        {redefineScanResult?.issues.map((warning) => (
          <ListItem key={warning.category} alignItems="flex-start">
            <ListItemAvatar>
              <Chip sx={{ minWidth: '72px' }} label={warning.severity.label} />
            </ListItemAvatar>
            <ListItemText inset>
              <Grid container direction="row" gap={1}>
                <Grid item xs={3}>
                  <Typography variant="caption">Description</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{warning.description.short}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption">Advice</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{warning.description.long}</Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </>
  )
}
