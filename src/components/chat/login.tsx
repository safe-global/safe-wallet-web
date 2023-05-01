import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import NewChatIcon from '@/public/images/chat/chat.svg'
import LogoGreen from '@/public/images/logo-green.svg'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Box, Button, Grid, Paper, Stack, SvgIcon, Typography } from '@mui/material'
import { Container } from '@mui/system'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { loginWithCometChat, signUpWithCometChat, initCometChat } from '../../services/chat'
import css from './styles.module.css'

const Login: React.FC<{
  setCurrentUser: any
}> = ({ setCurrentUser }) => {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    initCometChat()
    if (!wallet?.address) return
    //handleLogin()
  }, [safeAddress])

  const handleLogin = async () => {
    console.log(wallet)
    if (!wallet?.address) return
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await loginWithCometChat(wallet?.address)
          .then((user) => {
            setCurrentUser(user)
            console.log(user)
          })
          .catch((err) => {
            console.log(err)
            reject()
          })
      }),
      {
        pending: 'Logging in...',
        success: 'Logged in successfully 👌',
        error: 'Error, are you signed up? 🤯',
      },
    )
  }

  const handleSignup = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await signUpWithCometChat(wallet?.address!)
          .then((user) => {
            console.log(user)
            resolve(user)
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
      }),
      {
        pending: 'Signing up...',
        success: 'Signed up successfully 👌',
        error: 'Error, maybe you should login instead? 🤯',
      },
    )
  }

  return (
    <Container>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs lg={4} order={{ xs: 2, sm: 1 }}>
            <Paper sx={{ padding: 4, height: 1, maxWidth: '400px' }} className={css.loginwindowelement}>
              <SvgIcon component={NewChatIcon} inheritViewBox sx={{ width: '42px', height: '42px' }} />
              <Typography variant="h3" fontWeight={700} mb={1} mt={3}>
                Chat with your safe members now
              </Typography>

              <Typography variant="body2" mb={3}>
                Online messaging and signing transactions made easy.
              </Typography>

              <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
                <Button variant="contained" onClick={handleLogin}>
                  Log in
                </Button>
                <Button variant="text" onClick={handleSignup}>
                  Sign up <ChevronRightIcon />
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs order={{ xs: 1, sm: 2 }}>
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SvgIcon component={LogoGreen} inheritViewBox sx={{ width: '300px', height: '300px' }} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default Login
