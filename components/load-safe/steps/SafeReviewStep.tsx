import React from 'react'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from 'components/common/EthHashInfo'
import { LoadSafeFormDataReview } from '@/components/load-safe'
import { useAppDispatch, useAppSelector } from '@/store'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { selectChainById } from '@/store/chainsSlice'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import useWallet from '@/hooks/wallets/useWallet'
import { isOwner } from '@/utils/transaction-guards'
import { defaultSafeInfo } from '@/store/safeInfoSlice'

type Props = {
  params: LoadSafeFormDataReview
  onBack: StepRenderProps['onBack']
}

const SafeReviewStep = ({ params, onBack }: Props) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const chain = useAppSelector((state) => selectChainById(state, params.chainId))
  const wallet = useWallet()
  const isSafeOwner = wallet && isOwner(params.owners, wallet.address)

  const addSafe = () => {
    dispatch(
      addOrUpdateSafe({
        safe: {
          ...defaultSafeInfo,
          address: { value: params.safeAddress.address, name: params.safeAddress.name },
          threshold: params.threshold,
          owners: params.owners.map((owner) => ({
            value: owner.address,
            name: owner.name,
          })),
          chainId: params.chainId,
        },
      }),
    )
    dispatch(
      upsertAddressBookEntry({
        chainId: params.chainId,
        address: params.safeAddress.address,
        name: params.safeAddress.name,
      }),
    )
    for (const { address, name } of params.owners) {
      dispatch(upsertAddressBookEntry({ chainId: params.chainId, address, name: name ?? '' }))
    }
    router.push({
      pathname: AppRoutes.safe.index,
      query: { safe: `${chain?.shortName}:${params.safeAddress.address}` },
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

            {params.safeAddress.name && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Name of the Safe
                </Typography>
                <Typography mb={3}>{params.safeAddress.name}</Typography>
              </>
            )}
            <Typography variant="caption" color="text.secondary">
              Safe address
            </Typography>
            <Typography mb={3} component="div">
              <EthHashInfo
                key={params.safeAddress.address}
                address={params.safeAddress.address}
                name={params.safeAddress.name}
                shortAddress
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
              return <EthHashInfo key={owner.address} address={owner.address} name={owner.name} shortAddress={false} />
            })}
          </Box>
          <Divider />
        </Grid>
      </Grid>
      <Divider />
      <Box padding={3}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item>
            <Button onClick={onBack}>Back</Button>
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
