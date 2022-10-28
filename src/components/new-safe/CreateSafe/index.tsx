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
import CreateSafeStep3 from '@/components/new-safe/steps/Step3'
import type { AlertColor } from '@mui/material'
import type { CreateSafeInfoItem } from '../CreateSafeInfos'
import CreateSafeInfos from '../CreateSafeInfos'
import { useMemo, useState } from 'react'

export type NewSafeFormData = {
  name: string
  threshold: number
  owners: NamedAddress[]
  mobileOwners: NamedAddress[]
}

const staticHints: Record<number, { title: string; variant: AlertColor; steps: { title: string; text: string }[] }> = {
  0: {
    title: 'Safe Creation',
    variant: 'info',
    steps: [
      {
        title: 'Network fee',
        text: 'Deploying your Safe contract requires the payment of the associated network fee with your connected wallet. An estmation will be provided in the last step.',
      },
    ],
  },
  1: {
    title: 'Safe Creation',
    variant: 'info',
    steps: [
      {
        title: 'Flat hierarchy',
        text: 'Every owner has the same rights within the Safe and can propose, sign and execute transactions.',
      },
      {
        title: 'Managing Owners',
        text: 'You can always change the amount of owners and required confirmations in your Safe at a later stage after the creation.',
      },
      {
        title: 'Safe Setup',
        text: 'Not sure how many owners and confirmations you need for your Safe? Learn more about setting up your Safe.',
      },
    ],
  },
  2: {
    title: 'Safe Creation',
    variant: 'info',
    steps: [
      {
        title: 'Wait for the creation',
        text: 'Depending on the network congestion, it can take some time until the transaction is successfully included on the network and picked up by our services.',
      },
    ],
  },
  3: {
    title: 'Safe Usage',
    variant: 'success',
    steps: [
      {
        title: 'Connect your Safe',
        text: 'In our Safe App section you can connect your Safe to over 70 dApps directly or use Wallet Connect to interact with any application.',
      },
    ],
  },
}

const CreateSafe = () => {
  const router = useRouter()
  const wallet = useWallet()
  const addressBook = useAddressBook()
  const defaultOwnerAddressBookName = wallet?.address ? addressBook[wallet.address] : undefined
  const defaultOwner: NamedAddress = {
    name: defaultOwnerAddressBookName || wallet?.ens || '',
    address: wallet?.address || '',
  }

  const [safeName, setSafeName] = useState('')
  const [dynamicHint, setDynamicHint] = useState<CreateSafeInfoItem>()
  const [activeStep, setActiveStep] = useState(0)

  const CreateSafeSteps: TxStepperProps<NewSafeFormData>['steps'] = [
    {
      title: 'Select network and name Safe',
      subtitle: 'Select the network on which to create your Safe',
      render: (data, onSubmit, onBack) => (
        <CreateSafeStep1 setSafeName={setSafeName} onSubmit={onSubmit} onBack={onBack} data={data} />
      ),
    },
    {
      title: 'Owners and confirmations',
      subtitle:
        'Here you can add owners to your Safe and determine how many owners need to confirm before making a successful transaction',
      render: (data, onSubmit, onBack) => (
        <CreateSafeStep2 setDynamicHint={setDynamicHint} onSubmit={onSubmit} onBack={onBack} data={data} />
      ),
    },
    {
      title: 'Review',
      subtitle: `You're about to create a new Safe and will have to confirm a transaction with your currently connected wallet.`,
      render: (data, onSubmit, onBack) => <CreateSafeStep3 onSubmit={onSubmit} onBack={onBack} data={data} />,
    },
  ]

  const staticHint = useMemo(() => staticHints[activeStep], [activeStep])

  const initialData: NewSafeFormData = {
    name: '',
    mobileOwners: [] as NamedAddress[],
    owners: [defaultOwner],
    threshold: 1,
  }

  const onClose = () => {
    router.push(AppRoutes.welcome)
  }

  // TODO: Improve layout when other widget/responsive design is ready
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
              updateActiveStep={setActiveStep}
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
          <Grid container spacing={3}>
            {wallet?.address && activeStep < 2 && <OverviewWidget safeName={safeName} />}
            {wallet?.address && <CreateSafeInfos staticHint={staticHint} dynamicHint={dynamicHint} />}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}

export default CreateSafe
