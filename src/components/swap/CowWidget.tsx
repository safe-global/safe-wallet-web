//  Fill this form https://cowprotocol.typeform.com/to/rONXaxHV once you pick your "appCode"

import { SafeRpcProvider } from '@/services/safe-wallet-provider/rpc'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import { type CowSwapWidgetParams, TradeType, CowSwapWidget } from '@cowprotocol/widget-react'
import { useState, useEffect } from 'react'

export const CowWidget = () => {
  const walletProvider = useSafeWalletProvider()
  // const web3ReadOnly = useWeb3ReadOnly()
  // const provider = useWeb3ReadOnly()
  // console.log('web3 wallet', provider)
  const [params, setParams] = useState<CowSwapWidgetParams>({})
  // const connectedWallet = getConnectedWallet(web3Provider)
  // const [signer] = useAsync(async () => {
  //   const signer = await web3Provider.getSigner()
  //   // await signer.sendTransaction({ to: wallet.address, value: 0 })
  //   return signer
  // }, web3Provider)

  useEffect(() => {
    console.log('swap provider', walletProvider)
    if (!walletProvider) return

    const provider = new SafeRpcProvider(walletProvider)
    // const provider = new MyProvider(walletProvider)
    setParams({
      appCode: 'My Cool App', // Name of your app (max 50 characters)
      width: '450px', // Width in pixels (or 100% to use all available space)
      height: '640px',
      provider: provider, // Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com
      chainId: 1, // 1 (Mainnet), 5 (Goerli), 100 (Gnosis)
      tokenLists: [
        // All default enabled token lists. Also see https://tokenlists.org
        'https://files.cow.fi/tokens/CowSwap.json',
        'https://tokens.coingecko.com/uniswap/all.json',
      ],
      tradeType: TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED
      sell: {
        // Sell token. Optionally add amount for sell orders
        asset: 'USDC',
        amount: '10',
      },
      buy: {
        // Buy token. Optionally add amount for buy orders
        asset: 'COW',
        amount: '0',
      },
      enabledTradeTypes: [
        // TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED
        TradeType.SWAP,
        TradeType.LIMIT,
        TradeType.ADVANCED,
      ],
      theme: 'dark', // light/dark or provide your own color palette
      interfaceFeeBips: '50', // 0.5% - COMING SOON! Fill the form above if you are interested
    })
  }, [walletProvider])
  // useEffect(() => {
  //
  // })
  // console.log('web3Provider', signer)

  // if(!provider) return (<div>loading</div>)

  if (!params.provider) {
    console.log('swap params are null')
    return null
  }
  console.log('swap params', params, params.provider.enable())
  return (
    <div>
      <CowSwapWidget params={params} />
    </div>
  )
}
