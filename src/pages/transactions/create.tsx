import NewTxModal from '@/components/tx/modals/NewTxModal'
import { Suspense } from 'react'
import { Box, Button, Grid } from '@mui/material'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import useWallet from '@/hooks/wallets/useWallet'

interface ICreateTxPageProps {}

const CreateTxPage: React.FunctionComponent<ICreateTxPageProps> = (props) => {
  const handleConnect = useConnectWallet()
  const wallet = useWallet()
  return (
    <Suspense>
      {wallet ? (
        <NewTxModal onClose={() => undefined} />
      ) : (
        <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box width={100} height={100} display="flex" alignItems="center" justifyContent="center">
            <KeyholeIcon />
          </Box>

          <Button onClick={handleConnect} variant="contained" size="stretched" disableElevation>
            Connect
          </Button>
        </Grid>
      )}
    </Suspense>
  )
}

export default CreateTxPage
