import { Button, Typography, Grid } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useRouter } from 'next/router'

import WalletInfo from '@/components/common/WalletInfo'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import OverviewWidget from '../OverviewWidget'
import CreateSafeStep1 from '../steps/Step1'
import CreateSafeStep2 from '../steps/Step2'

const CreateSafe = () => {
  const router = useRouter()

  // TODO: These rows are just a demo
  const wallet = useWallet()
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
        <Button variant="text" startIcon={<ChevronLeftIcon />} onClick={onBack} sx={{ my: 4, mx: 0 }}>
          Back
        </Button>
        <Typography variant="h2" pb={2}>
          Create new Safe
        </Typography>
      </Grid>

      <Grid item xs={1} />
      <Grid item xs={6}>
        <CreateSafeStep1 />
        <CreateSafeStep2 />
      </Grid>
      <Grid item xs={4}>
        <OverviewWidget rows={rows} />
      </Grid>
      <Grid item xs={1} />
    </Grid>
  )
}

export default CreateSafe
