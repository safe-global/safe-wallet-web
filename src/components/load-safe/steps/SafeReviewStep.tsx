import React from 'react'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useAppDispatch } from '@/store'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import useWallet from '@/hooks/wallets/useWallet'
import { isOwner } from '@/utils/transaction-guards'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import { useCurrentChain } from '@/hooks/useChains'
import type { SafeFormData } from '@/components/create-safe/types'
import { trackEvent, LOAD_SAFE_EVENTS } from '@/services/analytics'

type Props = {
  params: SafeFormData
  onBack: StepRenderProps['onBack']
}

const SafeReviewStep = ({ params, onBack }: Props) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const wallet = useWallet()
  const isSafeOwner = wallet && isOwner(params.owners, wallet.address)
  const currentChain = useCurrentChain()
  const chainId = currentChain?.chainId || ''

  const addSafe = () => {
    const safeName = params.name
    const safeAddress = params.address

    dispatch(
      addOrUpdateSafe({
        safe: {
          ...defaultSafeInfo,
          address: { value: safeAddress, name: safeName },
          threshold: params.threshold,
          owners: params.owners.map((owner) => ({
            value: owner.address,
            name: owner.name || owner.ens,
          })),
          chainId,
        },
      }),
    )

    dispatch(
      upsertAddressBookEntry({
        chainId,
        address: safeAddress,
        name: safeName,
      }),
    )

    for (const { address, name, ens } of params.owners) {
      const entryName = name || ens

      if (!entryName) {
        continue
      }

      dispatch(
        upsertAddressBookEntry({
          chainId,
          address,
          name: entryName,
        }),
      )
    }

    trackEvent({
      ...LOAD_SAFE_EVENTS.OWNERS,
      label: params.owners.length,
    })

    trackEvent({
      ...LOAD_SAFE_EVENTS.THRESHOLD,
      label: params.threshold,
    })

    trackEvent(LOAD_SAFE_EVENTS.GO_TO_SAFE)

    router.push({
      pathname: AppRoutes.home,
      query: { safe: `${currentChain?.shortName}:${safeAddress}` },
    })
  }

  return (
    <Paper>
      <Grid container>
        <Grid item md={4}>
          <Box padding={3}>
            <Typography mb={3}>Details</Typography>
            <Typography variant="caption" color="text.secondary">
              Network
            </Typography>
            <Typography mb={3}>
              <ChainIndicator inline />
            </Typography>

            {params.name && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Name of the Safe
                </Typography>
                <Typography mb={3}>{params.name}</Typography>
              </>
            )}
            <Typography variant="caption" color="text.secondary">
              Safe address
            </Typography>
            <Typography mb={3} component="div">
              <EthHashInfo
                key={params.address}
                address={params.address}
                showName={false}
                shortAddress
                showCopyButton
                hasExplorer
              />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Connected wallet client is owner?
            </Typography>
            <Typography mb={3}>{isSafeOwner ? 'Yes' : 'No'}</Typography>

            <Typography variant="caption" color="text.secondary">
              Any transaction requires the confirmation of:
            </Typography>
            <Typography mb={3}>
              {params.threshold} out of {params.owners.length}
            </Typography>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          borderLeft={({ palette }) => [undefined, undefined, `1px solid ${palette.border.light}`]}
          borderTop={({ palette }) => [`1px solid ${palette.border.light}`, undefined, 'none']}
        >
          <Box padding={3}>{params.owners.length} Safe owner(s)</Box>
          <Divider />
          <Box display="flex" flexDirection="column" gap={2} padding={3}>
            {params.owners.map((owner) => {
              return (
                <Box key={owner.address} mb={1}>
                  <EthHashInfo
                    address={owner.address}
                    name={owner.name || owner.ens}
                    shortAddress={false}
                    showCopyButton
                    hasExplorer
                  />
                </Box>
              )
            })}
          </Box>
          <Divider />
        </Grid>
      </Grid>
      <Divider />
      <Box padding={3}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item>
            <Button onClick={() => onBack()}>Back</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={addSafe}>
              Add
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default SafeReviewStep
