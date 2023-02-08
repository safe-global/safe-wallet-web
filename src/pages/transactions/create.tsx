import NewTxModal from '@/components/tx/modals/NewTxModal'
import { Suspense } from 'react'
import { Box, Button, Grid, Typography } from '@mui/material'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

interface ICreateTxPageProps {
  amount?: string
  to?: string
  currency?: string
  chatId?: string
  type?: string
}

const CreateTxPage: React.FunctionComponent<ICreateTxPageProps> = ({ amount, to, currency, type, chatId }) => {
  const handleConnect = useConnectWallet()
  const wallet = useWallet()
  const router = useRouter()

  return (
    <Suspense>
      {wallet ? (
        <NewTxModal
          recipient={to}
          amount={amount}
          currency={currency}
          type={type}
          onClose={() =>
            router.push({
              pathname: AppRoutes.home,
              query: { safe: router.query.safe },
            })
          }
        />
      ) : (
        <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box width={100} height={100} display="flex" alignItems="center" justifyContent="center">
            <KeyholeIcon />
          </Box>
          <Typography>Connect your wallet</Typography>

          <Button onClick={handleConnect} variant="contained" size="stretched" disableElevation>
            Connect
          </Button>
        </Grid>
      )}
    </Suspense>
  )
}

export async function getServerSideProps(context: any) {
  const { amount, to, currency, chatId, type } = context.query

  return {
    props: {
      amount: amount || '',
      to: to || '',
      currency: currency || '',
      chatId: chatId || '',
      type: type || '',
    },
  }
}

export default CreateTxPage
