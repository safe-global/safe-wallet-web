import { getAuthNonce, verifyAuth } from '@safe-global/safe-gateway-typescript-sdk'
import type { BrowserProvider } from 'ethers'

/**
 * Prompt the user to sign in with their wallet and set an access_token cookie
 * @param provider
 */
async function signInWithEthereum(provider: BrowserProvider) {
  const { nonce } = await getAuthNonce()

  const [network, signer] = await Promise.all([provider.getNetwork(), provider.getSigner()])

  const message = {
    domain: window.location.host,
    address: signer.address as `0x${string}`,
    // Results in special signing window in MetaMask
    statement: 'Sign in with Ethereum to the app.',
    uri: window.location.origin,
    version: '1',
    chainId: Number(network.chainId),
    nonce,
    issuedAt: new Date(),
  }

  const signableMessage = `${message.domain} wants you to sign in with your Ethereum account:
${message.address}

${message.statement}

URI: ${message.uri}
Version: ${message.version}
Chain ID: ${message.chainId}
Nonce: ${message.nonce}
Issued At: ${message.issuedAt.toISOString()}`

  const signature = await signer.signMessage(signableMessage)

  return verifyAuth({ message: signableMessage, signature })
}

export default signInWithEthereum
