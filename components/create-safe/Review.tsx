import React from 'react'
import type { Web3Provider } from '@ethersproject/providers'
import { CreateSafeFormData } from '@/components/create-safe/index'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { EthHashInfo } from '@gnosis.pm/safe-react-components'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import Safe, { SafeAccountConfig, SafeFactory } from '@gnosis.pm/safe-core-sdk'
import useWallet from '@/services/wallets/useWallet'
import ChainIndicator from '@/components/common/ChainIndicator'
import { getEthersAdapter } from '@/services/safe-core/safeCoreSDK'
import { useWeb3 } from '@/services/wallets/web3'

const createNewSafe = async (ethersProvider: Web3Provider, txParams: SafeAccountConfig): Promise<Safe> => {
  const ethAdapter = getEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return await safeFactory.deploySafe({ safeAccountConfig: txParams })
}

type Props = {
  params: CreateSafeFormData
  onBack: StepRenderProps['onBack']
}

const Review = ({ params, onBack }: Props) => {
  const wallet = useWallet()
  const ethersProvider = useWeb3()

  const createSafe = async () => {
    if (!wallet || !ethersProvider) return

    await createNewSafe(ethersProvider, {
      threshold: params.threshold,
      owners: params.owners.map((owner) => owner.address),
    })
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
          {params.owners.map((owner) => {
            return <EthHashInfo key={owner.address} />
          })}
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
