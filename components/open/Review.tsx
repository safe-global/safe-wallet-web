import React from 'react'
import { CreateSafeFormData } from '@/components/open/index'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { EthHashInfo } from '@gnosis.pm/safe-react-components'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import Safe, { SafeAccountConfig, SafeFactory } from '@gnosis.pm/safe-core-sdk'
import useWallet from '@/services/wallets/useWallet'
import { ethers } from 'ethers'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import { getWeb3 } from '@/services/wallets/web3'
import ChainIndicator from '@/components/common/ChainIndicator'
import css from '@/components/common/NetworkSelector/styles.module.css'

export const createNewSafe = async (txParams: SafeAccountConfig): Promise<Safe> => {
  const ethersProvider = getWeb3()
  const signer = ethersProvider.getSigner(0)
  const ethAdapter = new EthersAdapter({
    ethers,
    signer,
  })

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return await safeFactory.deploySafe({ safeAccountConfig: txParams })
}

type Props = {
  params: CreateSafeFormData
  onBack: StepRenderProps['onBack']
}

const Review = ({ params, onBack }: Props) => {
  const wallet = useWallet()

  const createSafe = async () => {
    if (!wallet) return

    await createNewSafe({
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
          You are about to create a new Safe on <ChainIndicator className={css.inlineIndicator} /> and will have to
          confirm a transaction with your currently connected wallet. The creation will cost approximately
          GAS_ESTIMATION. The exact amount will be determined by your wallet.
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
