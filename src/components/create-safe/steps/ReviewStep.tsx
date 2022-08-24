import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'
import useResetSafeCreation from '@/components/create-safe/useResetSafeCreation'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useGasPrice from '@/hooks/useGasPrice'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3 } from '@/hooks/wallets/web3'
import { safeFormatAmount } from '@/utils/formatters'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useEstimateSafeCreationGas } from '../useEstimateSafeCreationGas'
import { computeNewSafeAddress } from '@/components/create-safe/sender'
import { useCurrentChain } from '@/hooks/useChains'
import { SafeFormData } from '@/components/create-safe/types'

type Props = {
  params: SafeFormData
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
      ? safeFormatAmount(maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit), chain?.nativeCurrency.decimals)
      : '> 0.001'

  const createSafe = async () => {
    if (!wallet || !ethersProvider) return

    const props = {
      safeAccountConfig: {
        threshold: params.threshold,
        owners: params.owners.map((owner) => owner.address),
      },
      safeDeploymentConfig: {
        saltNonce: saltNonce.toString(),
      },
    }

    const safeAddress = await computeNewSafeAddress(ethersProvider, props)

    setPendingSafe({ ...params, address: safeAddress, saltNonce })
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
              return (
                <Box key={owner.address} mb={1}>
                  <EthHashInfo address={owner.address} name={owner.name} shortAddress={false} showName />
                </Box>
              )
            })}
          </Box>
          <Divider />
        </Grid>
      </Grid>
      <Box padding={3} bgcolor={(theme) => theme.palette.background.main}>
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
