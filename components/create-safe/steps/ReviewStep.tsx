import React, { useMemo } from 'react'
import { CreateSafeFormData } from '@/components/create-safe'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useWallet from '@/hooks/wallets/useWallet'
import ChainIndicator from '@/components/common/ChainIndicator'
import { useWeb3 } from '@/hooks/wallets/web3'
import EthHashInfo from '@/components/common/EthHashInfo'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'
import useResetSafeCreation from '@/components/create-safe/useResetSafeCreation'
import useGasPrice from '@/hooks/useGasPrice'
import { useEstimateSafeCreationGas } from '../useEstimateSafeCreationGas'
import { safeFormatUnits } from '@/utils/formatters'
import { useCurrentChain } from '@/hooks/useChains'

type Props = {
  params: CreateSafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
  setStep: StepRenderProps['setStep']
}

const ReviewStep = ({ params, onSubmit, setStep, onBack }: Props) => {
  useResetSafeCreation(setStep)
  const wallet = useWallet()
  const ethersProvider = useWeb3()
  const [_, setPendingSafe] = usePendingSafe()
  const chain = useCurrentChain()
  const saltNonce = useMemo(() => Date.now(), [])

  const { maxFeePerGas, maxPriorityFeePerGas } = useGasPrice()

  const { gasLimit } = useEstimateSafeCreationGas({
    owners: params.owners.map((owner) => owner.address),
    threshold: params.threshold,
    saltNonce,
  })

  const totalFee =
    gasLimit && maxFeePerGas && maxPriorityFeePerGas
      ? safeFormatUnits(maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit), chain?.nativeCurrency.decimals)
      : '> 0.001'

  const createSafe = async () => {
    if (!wallet || !ethersProvider) return

    setPendingSafe({ ...params, saltNonce })
    onSubmit(params)
  }

  return (
    <Paper>
      <Grid container>
        <Grid item xs={12} md={4}>
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
        <Grid
          item
          xs={12}
          md={8}
          borderLeft={({ palette }) => [undefined, undefined, `1px solid ${palette.border.light}`]}
          borderTop={({ palette }) => [`1px solid ${palette.border.light}`, undefined, 'none']}
        >
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
          your currently connected wallet. The creation will cost approximately {totalFee}{' '}
          {chain?.nativeCurrency.symbol}. The exact amount will be determined by your wallet.
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

export default ReviewStep
