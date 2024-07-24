import { useWeb3 } from '@/hooks/wallets/web3'
import { getUserAccount, signInWithEthereum } from '@/services/siwe'
import { Alert, Box, Button, IconButton, Typography } from '@mui/material'
import useWallet from '@/hooks/wallets/useWallet'
import CloseIcon from '@mui/icons-material/Close'
import DownloadCloud from '@/public/images/common/download-cloud.svg'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import css from './style.module.css'

const SignInBanner = () => {
  const provider = useWeb3()
  const { address = '' } = useWallet() || {}

  if (!provider) return null

  const signIn = async () => {
    try {
      await signInWithEthereum(provider)
      await getUserAccount(address)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={css.container}>
      <Alert
        icon={<DownloadCloud />}
        action={
          <>
            <Button onClick={signIn} endIcon={<ChevronRightIcon />} sx={{ padding: '2px', minWidth: '130px' }}>
              <Typography noWrap fontWeight={700}>
                Enable now
              </Typography>
            </Button>
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                // setOpen(false)
              }}
            >
              <CloseIcon fontSize="inherit" sx={{ color: 'border.main' }} />
            </IconButton>
          </>
        }
      >
        <Box display="flex" alignContent="center" alignItems="center" width="100%">
          <Typography flex="1">
            <b>Access your accounts on any device!</b> Enable cloud storage to switch devices effortlessly and keep your
            data secure.
          </Typography>
        </Box>
      </Alert>
    </div>
  )
}

export default SignInBanner
