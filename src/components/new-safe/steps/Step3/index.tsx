import type { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Grid, Typography, Divider } from '@mui/material'
import StepCard from '@/components/new-safe/StepCard'
import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { NamedAddress } from '@/components/create-safe/types'
import css from './styles.module.css'
import { useCurrentChain } from '@/hooks/useChains'

type CreateSafeStep3Form = {
  name: string
  owners: NamedAddress[]
  threshold: number
  networkFee: string
}

const STEP_3_FORM_ID = 'create-safe-step-3-form'

const CreateSafeStep3 = (): ReactElement => {
  const chain = useCurrentChain()

  // TODO: Get the Safe name from previous steps
  const newSafeName = 'My Safe'
  const safeOwners = [
    {
      name: 'My Wallet',
      address: '0x85380007df137839015c2c1254c4b6cec130c589',
    },
    {
      name: 'Marta',
      address: '0x37380007DF8493237515C2C1254c4b6cec130K771',
    },
    {
      name: 'John',
      address: '0x457820007DF137839015C2C1254c4b6cec130C0955',
    },
  ]
  const safeThreshold = 1
  const gasEstimation = '0.04185'

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
                        <b>{gasEstimation} ETH</b>
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
