import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Button, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { initCometChat, loginWithCometChat, signUpWithCometChat } from '../../services/chat'

const LoginButton: React.FC<{
  setCurrentUser: any
}> = ({ setCurrentUser }) => {
  const [signedUp, setSignedUp] = useState<boolean>(false)
  const wallet = useWallet()
  const safeAddress = useSafeAddress()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    initCometChat()
    handleSignup().then(() => setSignedUp(true)).catch()
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
        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
          <Button variant="outlined" onClick={handleLogin}>
            Log in
          </Button>
          {
            !signedUp || <Button variant="text" onClick={handleSignup}>
              Sign up <ChevronRightIcon />
            </Button>
          }
          
        </Stack>
  )
}

export default LoginButton
