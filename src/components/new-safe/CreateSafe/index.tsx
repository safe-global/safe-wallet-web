import { useRouter } from 'next/router'

import WalletInfo from '@/components/common/WalletInfo'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import OverviewWidget from '../OverviewWidget'
import type { NamedAddress } from '@/components/create-safe/types'
import type { TxStepperProps } from '../CardStepper/useCardStepper'
import CreateSafeStep1 from '../steps/Step1'
import useAddressBook from '@/hooks/useAddressBook'
import CreateSafeStep2 from '../steps/Step2'
import { CardStepper } from '../CardStepper'
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'

export type NewSafeFormData = {
  name: string
  threshold: number
  owners: NamedAddress[]
  mobileOwners: NamedAddress[]
}

export const CreateSafeSteps: TxStepperProps<NewSafeFormData>['steps'] = [
  {
    title: 'Select network and name Safe',
    subtitle: 'Select the network on which to create your Safe',
    render: (data, onSubmit, onBack) => <CreateSafeStep1 onSubmit={onSubmit} onBack={onBack} data={data} />,
  },
  {
    title: 'Owners and confirmations',
    subtitle:
      'Here you can add owners to your Safe and determine how many owners need to confirm before making a successful transaction',
    render: (data, onSubmit, onBack) => <CreateSafeStep2 onSubmit={onSubmit} onBack={onBack} data={data} />,
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
  const chain = useCurrentChain()
  const rows = [
    ...(wallet && chain ? [{ title: 'Wallet', component: <WalletInfo wallet={wallet} chain={chain} /> }] : []),
  ]

  const onBack = () => {
    router.back()

    // Logic to be handled by stepper hook
  }

  // TODO: Improve layout when other widget/responsive design is ready
  return (
    <Grid container spacing={3}>
      <Grid item xs={1} />
      <Grid item xs={11}>
        <Typography variant="h2" pb={2}>
          Create new Safe
        </Typography>
      </Grid>

      <Grid item xs={1} />
      <Grid item xs={6}>
        <CardStepper
          initialData={initialData}
          onClose={() => {}}
          steps={CreateSafeSteps}
          eventCategory="NewSafeCreation"
        />
      </Grid>
      <Grid item xs={4}>
        <OverviewWidget rows={rows} />
      </Grid>
      <Grid item xs={1} />
    </Grid>
  )
}

export default CreateSafe
