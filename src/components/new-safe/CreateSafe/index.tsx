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
import { Card, CardContent, Container, Typography } from '@mui/material'
import { useRouter } from 'next/router'
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
          {wallet?.address ? (
            <CardStepper
              initialData={initialData}
              onClose={onClose}
              steps={CreateSafeSteps}
              eventCategory={CREATE_SAFE_CATEGORY}
            />
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h3" fontWeight={700}>
                  You need to connect a wallet to create a new Safe.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4} mb={[3, null, 0]} order={[0, null, 1]}>
          {wallet?.address && <OverviewWidget rows={rows} />}
        </Grid>
      </Grid>
    </Container>
  )
}

export default CreateSafe
