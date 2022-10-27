import { useMemo, type ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Grid, Typography, Divider } from '@mui/material'
import StepCard from '@/components/new-safe/StepCard'
import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { NamedAddress } from '@/components/create-safe/types'
import { useCurrentChain } from '@/hooks/useChains'
import useGasPrice from '@/hooks/useGasPrice'
import { useEstimateSafeCreationGas } from '@/components/create-safe/useEstimateSafeCreationGas'
import { formatVisualAmount } from '@/utils/formatters'
import css from './styles.module.css'

type CreateSafeStep3Form = {
  name: string
  owners: NamedAddress[]
  threshold: number
  networkFee: string
}

const STEP_3_FORM_ID = 'create-safe-step-3-form'

const CreateSafeStep3 = (): ReactElement => {
  const chain = useCurrentChain()
  const { maxFeePerGas, maxPriorityFeePerGas } = useGasPrice()
  const saltNonce = useMemo(() => Date.now(), [])

  // TODO: Get the Safe name from previous steps
  const newSafeName = 'My Safe'
  const safeOwners = [
    {
      name: 'My Wallet',
      address: '0x85380007df137839015c2c1254c4b6cec130c589',
    },
    {
      name: 'Marta',
      address: '0xc81DeFC11034BDdFbFeeF299987Cd8f74A5B9bd8',
    },
    {
      name: 'John',
      address: '0xE297437d6b53890cbf004e401F3acc67c8b39665',
    },
  ]
  const safeThreshold = 1

  const { gasLimit } = useEstimateSafeCreationGas({
    owners: safeOwners.map((owner) => owner.address),
    threshold: safeThreshold,
    saltNonce,
  })

  const totalFee =
    gasLimit && maxFeePerGas && maxPriorityFeePerGas
      ? formatVisualAmount(maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit), chain?.nativeCurrency.decimals)
      : '> 0.001'

  const formMethods = useForm<CreateSafeStep3Form>({
    mode: 'all',
  })

  const { handleSubmit } = formMethods

  const onSubmit = (data: CreateSafeStep3Form) => {
    console.log(data)
  }

  return (
    <StepCard
      step={3}
      title="Review"
      subheader={`You're about to create a new Safe on ${chain?.chainName} and will have to confirm a transaction with your currently connected wallet.`}
      content={
        <form onSubmit={handleSubmit(onSubmit)} id={STEP_3_FORM_ID}>
          <FormProvider {...formMethods}>
            <Grid container spacing={3}>
              <Grid item>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Typography>Network</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <ChainIndicator chainId={chain?.chainId} inline />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography>Name</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{newSafeName}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography>Owners</Typography>
                  </Grid>
                  <Grid item xs={8} className={css.ownersArray}>
                    {safeOwners.map((owner, index) => (
                      <EthHashInfo address={owner.address} showPrefix={false} key={index} />
                    ))}
                  </Grid>
                  <Grid item xs={4}>
                    <Typography>Threshold</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>
                      {safeThreshold} out of {safeOwners.length} owner(s)
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ ml: '-52px', mr: '-52px', mb: 4, mt: 3 }} />
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <Typography>Est. network fee</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        <b>
                          {totalFee} {chain?.nativeCurrency.symbol}
                        </b>
                      </Typography>
                    </Grid>

                    <Grid item xs={4} />
                    <Grid item xs={8}>
                      <Typography color="text.secondary">
                        You will have to confirm a transaction with your currently connected wallet.
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FormProvider>
        </form>
      }
      actions={
        <>
          <Button variant="contained" form={STEP_3_FORM_ID} type="submit">
            Continue
          </Button>
          <Button variant="text">Back</Button>
        </>
      }
    />
  )
}

export default CreateSafeStep3
