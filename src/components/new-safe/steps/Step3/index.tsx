import { useMemo, type ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Grid, Typography, Divider, Box } from '@mui/material'
import StepCard from '@/components/new-safe/StepCard'
import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { NamedAddress } from '@/components/create-safe/types'
import { useCurrentChain } from '@/hooks/useChains'
import useGasPrice from '@/hooks/useGasPrice'
import { useEstimateSafeCreationGas } from '@/components/create-safe/useEstimateSafeCreationGas'
import { formatVisualAmount } from '@/utils/formatters'
import css from './styles.module.css'

enum CreateSafeStep3Fields {
  name = 'name',
  owners = 'owners',
  threshold = 'threshold',
}

type CreateSafeStep3Form = {
  name: string
  owners: NamedAddress[]
  threshold: number
  networkFee: string
}

const STEP_3_FORM_ID = 'create-safe-step-3-form'

const ReviewRow = ({ name, value }: { name: string; value: ReactElement }) => {
  return (
    <>
      <Grid item xs={3}>
        <Typography>{name}</Typography>
      </Grid>
      <Grid item xs={9}>
        {value}
      </Grid>
    </>
  )
}

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
    defaultValues: {
      [CreateSafeStep3Fields.name]: newSafeName,
      [CreateSafeStep3Fields.owners]: safeOwners,
      [CreateSafeStep3Fields.threshold]: safeThreshold,
    },
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
                  <ReviewRow name="Network" value={<ChainIndicator chainId={chain?.chainId} inline />} />
                  <ReviewRow name="Name" value={<Typography>{newSafeName}</Typography>} />
                  <ReviewRow
                    name="Owners"
                    value={
                      <Box className={css.ownersArray}>
                        {safeOwners.map((owner, index) => (
                          <EthHashInfo address={owner.address} shortAddress={false} showPrefix={false} key={index} />
                        ))}
                      </Box>
                    }
                  />
                  <ReviewRow
                    name="Threshold"
                    value={
                      <Typography>
                        {safeThreshold} out of {safeOwners.length} owner(s)
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ ml: '-52px', mr: '-52px', mb: 4, mt: 3 }} />
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <ReviewRow
                      name="Est. network fee"
                      value={
                        <Box p={1} sx={{ backgroundColor: 'secondary.background', width: 'fit-content' }}>
                          <Typography variant="body1">
                            <b>
                              &asymp; {totalFee} {chain?.nativeCurrency.symbol}
                            </b>
                          </Typography>
                        </Box>
                      }
                    />
                    <ReviewRow
                      name=""
                      value={
                        <Typography color="text.secondary">
                          You will have to confirm a transaction with your currently connected wallet.
                        </Typography>
                      }
                    />
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
