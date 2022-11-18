import { Container, Typography, Grid, Link, SvgIcon } from '@mui/material'
import { useRouter } from 'next/router'

import useWallet from '@/hooks/wallets/useWallet'
import OverviewWidget from '../OverviewWidget'
import type { NamedAddress } from '@/components/create-safe/types'
import type { TxStepperProps } from '../CardStepper/useCardStepper'
import CreateSafeStep0 from '@/components/new-safe/steps/Step0'
import CreateSafeStep1 from '@/components/new-safe/steps/Step1'
import CreateSafeStep2 from '@/components/new-safe/steps/Step2'
import CreateSafeStep3 from '@/components/new-safe/steps/Step3'
import { CreateSafeStatus } from '@/components/new-safe/steps/Step4'
import useAddressBook from '@/hooks/useAddressBook'
import { CardStepper } from '../CardStepper'
import { AppRoutes } from '@/config/routes'
import { CREATE_SAFE_CATEGORY } from '@/services/analytics'
import type { AlertColor } from '@mui/material'
import type { CreateSafeInfoItem } from '../CreateSafeInfos'
import CreateSafeInfos from '../CreateSafeInfos'
import { type ReactElement, useMemo, useState } from 'react'
import LinkIcon from '@/public/images/sidebar/link.svg'

export type NewSafeFormData = {
  name: string
  threshold: number
  owners: NamedAddress[]
  mobileOwners: NamedAddress[]
  saltNonce: number
  safeAddress?: string
}

const staticHints: Record<
  number,
  { title: string; variant: AlertColor; steps: { title: string; text: string | ReactElement }[] }
> = {
  1: {
    title: 'Safe Creation',
    variant: 'info',
    steps: [
      {
        title: 'Network fee',
        text: 'Deploying your Safe requires the payment of the associated network fee with your connected wallet. An estmation will be provided in the last step.',
      },
      {
        title: 'Address book privacy',
        text: 'The name of your Safe will be stored in a local address book and can be changed at a later stage. It will not be shared with us or any third party.',
      },
    ],
  },
  2: {
    title: 'Safe Creation',
    variant: 'info',
    steps: [
      {
        title: 'Flat hierarchy',
        text: 'Every owner has the same rights within the Safe and can propose, sign and execute transactions.',
      },
      {
        title: 'Managing Owners',
        text: 'You can always change the amount of owners and required confirmations in your Safe at a later stage after creation.',
      },
      {
        title: 'Safe Setup',
        text: (
          <>
            Not sure how many owners and confirmations you need for your Safe?
            <br />
            <Link
              href="https://help.gnosis-safe.io/en/articles/4772567-what-safe-setup-should-i-use"
              target="_blank"
              rel="noopener noreferrer"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              sx={{ '&:hover svg path': { fill: 'inherit' } }}
            >
              Learn more about setting up your Safe.
              <SvgIcon component={LinkIcon} inheritViewBox />
            </Link>
          </>
        ),
      },
    ],
  },
  3: {
    title: 'Safe Creation',
    variant: 'info',
    steps: [
      {
        title: 'Wait for the creation',
        text: 'Depending on network congestion, it can take some time until the transaction is successfully added to the network and picked up by our services.',
      },
    ],
  },
  4: {
    title: 'Safe Usage',
    variant: 'success',
    steps: [
      {
        title: 'Connect your Safe',
        text: 'In our Safe Apps section you can connect your Safe to over 70 dApps directly or use Wallet Connect to interact with any application.',
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
      title: 'Connect wallet',
      subtitle: 'The connected wallet will pay the network fees for the Safe creation.',
      render: (data, onSubmit, onBack, setStep) => (
        <CreateSafeStep0 data={data} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
      ),
    },
    {
      title: 'Select network and name Safe',
      subtitle: 'Select the network on which to create your Safe',
      render: (data, onSubmit, onBack, setStep) => (
        <CreateSafeStep1 setSafeName={setSafeName} data={data} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
      ),
    },
    {
      title: 'Owners and confirmations',
      subtitle:
        'Here you can add owners to your Safe and determine how many owners need to confirm it before executing a transaction',
      render: (data, onSubmit, onBack, setStep) => (
        <CreateSafeStep2
          setDynamicHint={setDynamicHint}
          data={data}
          onSubmit={onSubmit}
          onBack={onBack}
          setStep={setStep}
        />
      ),
    },
    {
      title: 'Review',
      subtitle:
        "You're about to create a new Safe and will have to confirm a transaction with your currently connected wallet",
      render: (data, onSubmit, onBack, setStep) => (
        <CreateSafeStep3 data={data} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
      ),
    },
    {
      title: '',
      subtitle: '',
      render: (data, onSubmit, onBack, setStep) => (
        <CreateSafeStatus data={data} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
      ),
    },
  ]

  const staticHint = useMemo(() => staticHints[activeStep], [activeStep])

  const initialData: NewSafeFormData = {
    name: '',
    mobileOwners: [] as NamedAddress[],
    owners: [defaultOwner],
    threshold: 1,
    saltNonce: Date.now(),
  }

  const onClose = () => {
    router.push(AppRoutes.welcome)
  }

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
            setWidgetStep={setActiveStep}
          />
        </Grid>

        <Grid item xs={12} md={4} mb={[3, null, 0]} order={[0, null, 1]}>
          <Grid container spacing={3}>
            {wallet?.address && activeStep < 3 && <OverviewWidget safeName={safeName} />}
            {wallet?.address && <CreateSafeInfos staticHint={staticHint} dynamicHint={dynamicHint} />}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}

export default CreateSafe
