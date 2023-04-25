import useAddressBook from '@/hooks/useAddressBook'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { ReceiverNotInAddressbook, UnexpectedDelegateCall, TransferToUnusedAddress } from '@/security/rules'
import { RuleBasedTransactionScanner, RedefineTransactionScanner } from '@/security/scan'
import { List, ListItem, ListItemAvatar, Chip, ListItemText, Grid, Typography } from '@mui/material'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { useMemo } from 'react'

export const TxSecurityWarnings = ({ safeTx }: { safeTx: SafeTransaction | undefined }) => {
  const { safe, safeAddress } = useSafeInfo()
  const chainId = useChainId()
  const wallet = useWallet()

  const addressBook = useAddressBook()
  const knownAddresses = useMemo(() => Object.keys(addressBook), [addressBook])

  const [ruleBasedScanResult, ruleBasedScanError, ruleBasedScanLoading] = useAsync(async () => {
    const provider = getWeb3ReadOnly()

    if (!safeTx || !wallet || !provider) {
      return undefined
    }

    const ruleBasedScanner = RuleBasedTransactionScanner([
      ReceiverNotInAddressbook(knownAddresses),
      UnexpectedDelegateCall,
      TransferToUnusedAddress,
    ])
    const scanResult = await ruleBasedScanner.scanTransaction(
      {
        chainId: Number(chainId),
        transaction: safeTx,
        safeAddress,
        walletAddress: wallet.address,
        threshold: safe.threshold,
      },
      provider,
    )

    return scanResult
  }, [chainId, knownAddresses, safeAddress, safeTx])

  const [redefineScanResult, redefineScanError, redefineScanLoading] = useAsync(async () => {
    const provider = getWeb3ReadOnly()
    if (!safeTx || !wallet || !provider) {
      return undefined
    }

    const scanResult = await RedefineTransactionScanner.scanTransaction(
      {
        chainId: Number(chainId),
        transaction: safeTx,
        safeAddress,
        walletAddress: wallet.address,
        threshold: safe.threshold,
      },
      provider,
    )

    return scanResult
  }, [chainId, knownAddresses, safeAddress, safeTx])

  return (
    <>
      <List>
        {ruleBasedScanResult?.triggeredWarnings.map((warning) => (
          <ListItem key={warning.id} alignItems="flex-start">
            <ListItemAvatar>
              <Chip
                sx={{ minWidth: '72px' }}
                label={warning.severity}
                color={
                  warning.severity === 'MEDIUM'
                    ? 'warning'
                    : warning.severity === 'HIGH' || warning.severity === 'CRITICAL'
                    ? 'error'
                    : 'info'
                }
              />
            </ListItemAvatar>
            <ListItemText inset>
              <Grid container direction="row" gap={1}>
                <Grid item xs={3}>
                  <Typography variant="caption">Description</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{warning.description}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption">Advice</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{warning.advice}</Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
        ))}
      </List>

      <List>
        {redefineScanResult?.triggeredWarnings.map((warning) => (
          <ListItem key={warning.id} alignItems="flex-start">
            <ListItemAvatar>
              <Chip
                sx={{ minWidth: '72px' }}
                label={warning.severity}
                color={
                  warning.severity === 'MEDIUM'
                    ? 'warning'
                    : warning.severity === 'HIGH' || warning.severity === 'CRITICAL'
                    ? 'error'
                    : 'info'
                }
              />
            </ListItemAvatar>
            <ListItemText inset>
              <Grid container direction="row" gap={1}>
                <Grid item xs={3}>
                  <Typography variant="caption">Description</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{warning.description}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption">Advice</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{warning.advice}</Typography>
                </Grid>
              </Grid>
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </>
  )
}
