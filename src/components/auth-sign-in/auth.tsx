import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi'
import { useAuthRequestChallengeEvm } from '@moralisweb3/next'

function SignIn() {
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { requestChallengeAsync } = useAuthRequestChallengeEvm()

  const handleAuth = async () => {
    if (isConnected) {
      await disconnectAsync()
    }

    const { account, chain } = await connectAsync({
      connector: new MetaMaskConnector(),
    })

    //@ts-ignore
    const { message } = await requestChallengeAsync({
      address: account,
      chainId: chain.id,
    })

    const signature = await signMessageAsync({ message })

    console.log(signature)
  }

  return (
    <div>
      <h3>Web3 Authentication</h3>
      <button onClick={handleAuth}>Authenticate via Metamask</button>
    </div>
  )
}

export default SignIn
