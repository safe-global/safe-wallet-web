import { useWeb3 } from '@/hooks/wallets/web3'
import signInWithEthereum from '.'
import { Button } from '@mui/material'
import { GATEWAY_URL_PRODUCTION } from '@/config/constants'
import useSafeInfo from '@/hooks/useSafeInfo'

const SignInButton = () => {
  const provider = useWeb3()
  const { safeAddress } = useSafeInfo()
  const url = `${GATEWAY_URL_PRODUCTION}/v1/accounts/${safeAddress}`

  if (!provider) return null

  const signIn = async () => {
    try {
      await signInWithEthereum(provider)
      const accountDetails = await fetch(url)
      console.log('!!!!', accountDetails)
    } catch (error) {
      console.log(error)
    }
  }

  return <Button onClick={signIn}>Sign in</Button>
}

export default SignInButton
