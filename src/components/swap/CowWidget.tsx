import { SafeRpcProvider } from '@/services/safe-wallet-provider/rpc'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import { type CowSwapWidgetParams, TradeType, CowSwapWidget } from '@cowprotocol/widget-react'
import { useState, useEffect } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import css from '@/components/tx-flow/flows/NewTx/styles.module.css'
import { Container, Grid } from '@mui/material'
// import css from './styles.module.css'

const supportedChains = [1, 100, 11155111]

const isSupportedChainForSwap = (chainId: number) => supportedChains.includes(chainId)
export const CowWidget  = () => {
  const walletProvider = useSafeWalletProvider()
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe

  const [params, setParams] = useState<CowSwapWidgetParams>({})

  useEffect(() => {
    if (!walletProvider) return

    const provider = new SafeRpcProvider(walletProvider)
    setParams({
      appCode: 'Safe Wallet Swaps', // Name of your app (max 50 characters)
      width: '450px', // Width in pixels (or 100% to use all available space)
      height: '640px',
      provider: provider, // Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com
      chainId: 11155111, // 1 (Mainnet), 5 (Goerli), 100 (Gnosis)
      tokenLists: [
        // All default enabled token lists. Also see https://tokenlists.org
        'https://files.cow.fi/tokens/CowSwap.json',
        'https://tokens.coingecko.com/uniswap/all.json',
      ],
      tradeType: TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED
      sell: {
        // Sell token. Optionally add amount for sell orders
        asset: 'USDC',
        amount: '0',
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


  if (!params.provider) {
    return null
  }

  if(!isSupportedChainForSwap(Number(chainId))) {
    return (
      <Container className={css.container}>
        <Grid container justifyContent="center">
          <div>Swaps are not supported on this chain</div>
        </Grid>
      </Container>
    )
  }

  return (
    <Container className={css.container}>
      <Grid container justifyContent="center">
      <CowSwapWidget params={params} />
      </Grid>
    </Container>
  )
}
