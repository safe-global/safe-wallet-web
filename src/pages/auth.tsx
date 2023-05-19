import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { signIn } from 'next-auth/react'
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi'
import { useRouter } from 'next/router'
import { useAuthRequestChallengeEvm } from '@moralisweb3/next'
import { useState } from 'react'

const Auth = () => {
  const router = useRouter()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { requestChallengeAsync } = useAuthRequestChallengeEvm()
  const { push } = useRouter()
  const [auth, setAuth] = useState<any>()

  const handleAuth = async () => {
    if (isConnected) {
      await disconnectAsync()
    }

    const { account, chain } = await connectAsync({
      connector: new MetaMaskConnector(),
    })
    //TO-DO: fix this type pls
    //@ts-ignore
    const { message } = await requestChallengeAsync({
      address: account,
      chainId: chain.id,
    })

    const signature = await signMessageAsync({ message })
    // redirect user after success authentication to '/user' page
    //@ts-ignore
    const { url } = await signIn('moralis-auth', {
      message,
      signature,
      redirect: false,
      callbackUrl: `/chat?safe=${router.query.safe}`,
    })
    /**
     * instead of using signIn(..., redirect: "/user")
     * we get the url from callback and push it to the router to avoid page refreshing
     */
    setAuth(url)
    push(url)
  }

  if (!auth) {
    return (
      <div>
        <h3>Web3 Authentication</h3>
        <button onClick={handleAuth}>Authenticate via Metamask</button>
      </div>
    )
  }
}

export default Auth
