import { Button, Typography, Grid } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useRouter } from 'next/router'

import WalletInfo from '@/components/common/WalletInfo'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import OverviewWidget from '../OverviewWidget'
import CreateSafeStep1 from '../steps/Step1'

import css from './styles.module.css'

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
      <Grid item xs={6}>
        <Button variant="text" startIcon={<ChevronLeftIcon />} className={css.back} onClick={onBack}>
          Back
        </Button>
        <Typography variant="h2" className={css.title}>
          Create new Safe
        </Typography>
      </Grid>
      <Grid item xs={5} />

      <Grid item xs={1} />
      <Grid item xs={6}>
        <CreateSafeStep1 />
      </Grid>
      <Grid item xs={5}>
        <OverviewWidget rows={rows} />
      </Grid>
      <Grid item xs={1} />
    </Grid>
  )
}

export default CreateSafe
