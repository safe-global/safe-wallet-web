import { Container, Typography, Grid } from '@mui/material'
import { useRouter } from 'next/router'

import WalletInfo from '@/components/common/WalletInfo'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import OverviewWidget from '../OverviewWidget'
import type { NamedAddress } from '@/components/create-safe/types'
import type { TxStepperProps } from '../CardStepper/useCardStepper'
import CreateSafeStep0 from '@/components/new-safe/steps/Step0'
import CreateSafeStep1 from '@/components/new-safe/steps/Step1'
import CreateSafeStep2 from '@/components/new-safe/steps/Step2'
import CreateSafeStep3 from '@/components/new-safe/steps/Step3'
import useAddressBook from '@/hooks/useAddressBook'
import { CardStepper } from '../CardStepper'

import { AppRoutes } from '@/config/routes'
import { CREATE_SAFE_CATEGORY } from '@/services/analytics'

export type NewSafeFormData = {
  name: string
  threshold: number
  owners: NamedAddress[]
  mobileOwners: NamedAddress[]
}

export const CreateSafeSteps: TxStepperProps<NewSafeFormData>['steps'] = [
  {
    title: 'Connect wallet',
    subtitle: 'In order to create a Safe you need to connect a wallet',
    render: (data, onSubmit, onBack, setStep) => (
      <CreateSafeStep0 data={data} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
  {
    title: 'Select network and name Safe',
    subtitle: 'Select the network on which to create your Safe',
    render: (data, onSubmit, onBack, setStep) => (
      <CreateSafeStep1 data={data} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
  {
    title: 'Owners and confirmations',
    subtitle:
      'Here you can add owners to your Safe and determine how many owners need to confirm before making a successful transaction',
    render: (data, onSubmit, onBack, setStep) => (
      <CreateSafeStep2 data={data} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
  {
    title: 'Review',
    subtitle: `You're about to create a new Safe and will have to confirm a transaction with your currently connected wallet.`,
    render: (data, onSubmit, onBack, setStep) => (
      <CreateSafeStep3 data={data} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
]

const CreateSafe = () => {
  const router = useRouter()
  const wallet = useWallet()
  const addressBook = useAddressBook()
  const defaultOwnerAddressBookName = wallet?.address ? addressBook[wallet.address] : undefined
  const defaultOwner: NamedAddress = {
    name: defaultOwnerAddressBookName || wallet?.ens || '',
    address: wallet?.address || '',
  }

  const initialData: NewSafeFormData = {
    name: '',
    mobileOwners: [] as NamedAddress[],
    owners: [defaultOwner],
    threshold: 1,
  }

  const onClose = () => {
    router.push(AppRoutes.welcome)
  }

  const chain = useCurrentChain()
  const rows = [
    ...(wallet && chain ? [{ title: 'Wallet', component: <WalletInfo wallet={wallet} chain={chain} /> }] : []),
  ]

  return (
    <Container>
      <Grid container columnSpacing={3} justifyContent="center" mt={[2, null, 7]}>
        <Grid item xs={12}>
          <Typography variant="h2" pb={2}>
            Create new Safe
          </Typography>
        </Grid>
        <Grid item xs={12} md={8} order={[1, null, 0]}>
          <CardStepper
            initialData={initialData}
            onClose={onClose}
            steps={CreateSafeSteps}
            eventCategory={CREATE_SAFE_CATEGORY}
          />
        </Grid>

        <Grid item xs={12} md={4} mb={[3, null, 0]} order={[0, null, 1]}>
          {wallet?.address && <OverviewWidget rows={rows} />}
        </Grid>
      </Grid>
    </Container>
  )
}

export default CreateSafe
