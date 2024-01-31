import { type CowSwapWidgetParams, TradeType, CowSwapWidget } from '@cowprotocol/widget-react'
import { useState, useEffect, type MutableRefObject } from 'react'
import { Container, Grid, useTheme } from '@mui/material'
import useChainId from '@/hooks/useChainId'
import { useRef } from 'react'
import { Box } from '@mui/material'
import {
  SafeAppAccessPolicyTypes,
  type SafeAppData,
  SafeAppFeatures,
} from '@safe-global/safe-gateway-typescript-sdk/dist/types/safe-apps'
import { useCurrentChain } from '@/hooks/useChains'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useCustomAppCommunicator } from '@/hooks/safe-apps/useCustomAppCommunicator'

const supportedChains = [1, 100, 11155111]

const isSupportedChainForSwap = (chainId: number) => supportedChains.includes(chainId)
type Params = {
  sell?: {
    asset: string
    amount: string
  }
}

const appData: SafeAppData = {
  id: 1,
  url: 'https://app.safe.global',
  name: 'Safe Swap',
  iconUrl: 'https://app.safe.global/icon.png',
  description: 'Safe Apps',
  chainIds: ['1', '100'],
  accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
  tags: ['safe-apps'],
  features: [SafeAppFeatures.BATCHED_TRANSACTIONS],
  socialProfiles: [],
}
export const CowWidgetCommunicator = ({ sell }: Params) => {
  const chainId = useChainId()
  const { palette } = useTheme()
  const darkMode = useDarkMode()

  const [params, setParams] = useState<CowSwapWidgetParams | null>(null)
  useEffect(() => {
    setParams({
      appCode: 'Safe Wallet Swaps', // Name of your app (max 50 characters)
      width: '100%', // Width in pixels (or 100% to use all available space)
      height: '860px',
      // provider: safeAppWeb3Provider, // Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com
      chainId: chainId, // 1 (Mainnet), 5 (Goerli), 100 (Gnosis)
      tokenLists: [
        // All default enabled token lists. Also see https://tokenlists.org
        'https://files.cow.fi/tokens/CowSwap.json',
        'https://tokens.coingecko.com/uniswap/all.json',
      ],
      tradeType: TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED
      sell: sell
        ? sell
        : {
            // Sell token. Optionally add amount for sell orders
            asset: '',
            amount: '0',
          },
      enabledTradeTypes: [
        // TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED
        TradeType.SWAP,
        TradeType.LIMIT,
        TradeType.ADVANCED,
      ],
      // env: 'dev',
      theme: {
        baseTheme: darkMode ? 'dark' : 'light',
        primary: palette.primary.main,
        background: palette.background.main,
        paper: palette.background.paper,
        text: palette.text.primary,
        danger: palette.error.dark,
        info: palette.info.main,
        success: palette.success.main,
        warning: palette.warning.main,
        alert: palette.warning.main,
      },
      interfaceFeeBips: '50', // 0.5% - COMING SOON! Fill the form above if you are interested
    })
  }, [sell, chainId, palette, darkMode])

  const chain = useCurrentChain()

  const iframeRef: MutableRefObject<HTMLIFrameElement | null | undefined> = useRef<HTMLIFrameElement | null>()

  useEffect(() => {
    const iframeElement = document.querySelector('#swapWidget iframe')
    if (iframeElement) {
      iframeRef.current = iframeElement as HTMLIFrameElement
    }
  }, [params])

  useCustomAppCommunicator(iframeRef, appData, chain)

  if (!params) {
    return null
  }

  if (!isSupportedChainForSwap(Number(chainId))) {
    return (
      <Container>
        <Grid container justifyContent="center">
          <div>Swaps are not supported on this chain</div>
        </Grid>
      </Container>
    )
  }

  return (
    <Box sx={{ height: '100%' }} id={'swapWidget'}>
      <CowSwapWidget params={params} />
    </Box>
  )
}
