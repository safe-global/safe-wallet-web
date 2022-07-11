import React from 'react'
import type { Web3Provider } from '@ethersproject/providers'
import { CreateSafeFormData } from '@/components/create-safe/index'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import Safe, { DeploySafeProps, SafeFactory } from '@gnosis.pm/safe-core-sdk'
import useWallet from '@/hooks/wallets/useWallet'
import ChainIndicator from '@/components/common/ChainIndicator'
import { createEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import { useWeb3 } from '@/hooks/wallets/web3'
import EthHashInfo from '../common/EthHashInfo'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'

export const createNewSafe = async (ethersProvider: Web3Provider, props: DeploySafeProps): Promise<Safe> => {
  const ethAdapter = createEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return safeFactory.deploySafe(props)
}

type Props = {
  params: CreateSafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const Review = ({ params, onSubmit, onBack }: Props) => {
  const wallet = useWallet()
  const ethersProvider = useWeb3()
  const [_, setPendingSafe] = usePendingSafe()

  const createSafe = async () => {
    if (!wallet || !ethersProvider) return

    const saltNonce = Date.now()

    setPendingSafe({ ...params, saltNonce })
    onSubmit(params)
  }

  return (
    <Paper>
      <Grid container>
        <Grid item md={4}>
          <Box padding={3}>
            <Typography mb={3}>Details</Typography>
            <Typography variant="caption" color="text.secondary">
              Name of the new Safe
            </Typography>
            <Typography mb={3}>{params.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Any transaction requires the confirmation of:
            </Typography>
            <Typography mb={3}>
              {params.threshold} out of {params.owners.length}
            </Typography>
          </Box>
        </Grid>
        <Grid item md={8} borderLeft="1px solid #ddd">
          <Box padding={3}>{params.owners.length} Safe owners</Box>
          <Divider />
          <Box padding={3}>
            {params.owners.map((owner) => {
              return <EthHashInfo key={owner.address} address={owner.address} name={owner.name} shortAddress={false} />
            })}
          </Box>
          <Divider />
        </Grid>
      </Grid>
      <Box padding={3} bgcolor={(theme) => theme.palette.grey.A100}>
        <Typography textAlign="center">
          You are about to create a new Safe on <ChainIndicator inline /> and will have to confirm a transaction with
          your currently connected wallet. The creation will cost approximately GAS_ESTIMATION. The exact amount will be
          determined by your wallet.
        </Typography>
      </Box>
      <Divider />
      <Box padding={3}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item>
            <Button onClick={onBack}>Back</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={createSafe}>
              Create
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default Review
