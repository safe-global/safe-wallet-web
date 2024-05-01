import { FEATURES } from '@/utils/chains'
import { type CowSwapWidgetParams, TradeType, CowSwapWidget } from '@cowprotocol/widget-react'
import { CowEvents, type CowEventListeners } from '@cowprotocol/events'
import { useState, useEffect, type MutableRefObject, useMemo } from 'react'
import { Container, Grid, useTheme } from '@mui/material'
import useChainId from '@/hooks/useChainId'
import { useRef } from 'react'
import { Box } from '@mui/material'
import {
  SafeAppAccessPolicyTypes,
  type SafeAppData,
  SafeAppFeatures,
} from '@safe-global/safe-gateway-typescript-sdk/dist/types/safe-apps'
import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useCustomAppCommunicator } from '@/hooks/safe-apps/useCustomAppCommunicator'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch, useAppSelector } from '@/store'

import css from './styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import BlockedAddress from '@/components/common/BlockedAddress'
import { isBlockedAddress } from '@/services/ofac'
import useSwapConsent from './useSwapConsent'
import Disclaimer from '@/components/common/Disclaimer'
import LegalDisclaimerContent from '@/components/common/LegalDisclaimerContent'
import { selectSwapParams, setSwapParams } from './store/swapParamsSlice'

const BASE_URL = typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''

type Params = {
  sell?: {
    asset: string
    amount: string
  }
}

const appCode = 'Safe Wallet Swaps'
let hasInitializedFromStore = false

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
const SwapWidget = ({ sell }: Params) => {
  const chainId = useChainId()
  const { palette } = useTheme()
  const darkMode = useDarkMode()
  const dispatch = useAppDispatch()
  const isSwapFeatureEnabled = useHasFeature(FEATURES.NATIVE_SWAPS)
  const swapParams = useAppSelector(selectSwapParams)
  const { buyToken, sellToken } = swapParams

  const { safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const { isConsentAccepted, onAccept } = useSwapConsent()

  const [params, setParams] = useState<CowSwapWidgetParams | null>(null)

  const groupKey = 'swap-order-status'
  const listeners = useMemo<CowEventListeners>(() => {
    return [
      {
        event: CowEvents.ON_TOAST_MESSAGE,
        handler: (event) => {
          console.info('🍞 New toast message:', event)
          const { messageType } = event
          switch (messageType) {
            case 'ORDER_CREATED':
              dispatch(
                showNotification({
                  title: 'Swap transaction created',
                  message: 'Waiting for confirmation from signers of your Safe',
                  groupKey,
                  variant: 'info',
                }),
              )
              break
            case 'ORDER_PRESIGNED':
              dispatch(
                showNotification({
                  title: 'Swap transaction confirmed',
                  message: 'Waiting for swap execution by the CoW Protocol',
                  groupKey,
                  variant: 'info',
                }),
              )
              break
            case 'ORDER_FULFILLED':
              dispatch(
                showNotification({
                  title: 'Swap executed',
                  message: 'Your swap has been successful',
                  groupKey,
                  variant: 'info',
                }),
              )
              break
            case 'ORDER_EXPIRED':
              dispatch(
                showNotification({
                  title: 'Swap expired',
                  message: 'Your swap has reached the expiry time and has become invalid',
                  groupKey,
                  variant: 'warning',
                }),
              )
              break
            case 'ORDER_CANCELLED':
              dispatch(
                showNotification({
                  title: 'Swap cancelled',
                  message: 'Your swap has been cancelled',
                  groupKey,
                  variant: 'warning',
                }),
              )
              break
          }
        },
      },
      {
        event: CowEvents.ON_CHANGE_TRADE_PARAMS,
        handler: (newTradeParams) => {
          const { buyToken, sellToken } = newTradeParams
          console.info('🔄 New trade parameters (tradeParams):', event)
          dispatch(setSwapParams({ buyToken, sellToken }))
        },
      },
    ]
  }, [dispatch])

  useEffect(() => {
    setParams({
      appCode, // Name of your app (max 50 characters)
      width: '100%', // Width in pixels (or 100% to use all available space)
      height: '860px',
      // provider: safeAppWeb3Provider, // Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com
      chainId, // 1 (Mainnet), 5 (Goerli), 100 (Gnosis)
      standaloneMode: false,
      disableToastMessages: true,
      disablePostedOrderConfirmationModal: true,
      hideLogo: true,
      hideNetworkSelector: true,
      sounds: {
        orderError: null,
        orderExecuted: null,
        postOrder: null,
      },
      // tokenLists: [
      //   // All default enabled token lists. Also see https://tokenlists.org
      //   'https://files.cow.fi/tokens/CowSwap.json',
      //   'https://tokens.coingecko.com/uniswap/all.json',
      // ],
      tradeType: TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED
      sell: { asset: sellToken },
      buy: { asset: buyToken },
      images: {
        emptyOrders: darkMode
          ? BASE_URL + '/images/common/swap-empty-dark.svg'
          : BASE_URL + '/images/common/swap-empty-light.svg',
      },
      enabledTradeTypes: [TradeType.SWAP, TradeType.LIMIT],
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
      partnerFee: {
        bps: 50,
        recipient: '0x0B00b3227A5F3df3484f03990A87e02EbaD2F888',
      },
    })
  }, [sell, chainId, palette, darkMode, sellToken, buyToken])

  const chain = useCurrentChain()

  const iframeRef: MutableRefObject<HTMLIFrameElement | null> = useRef<HTMLIFrameElement | null>(null)

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

  if (isBlockedAddress(safeAddress)) {
    return <BlockedAddress address={safeAddress} />
  }
  if (wallet?.address && isBlockedAddress(wallet.address)) {
    return <BlockedAddress address={wallet.address} />
  }

  if (!isConsentAccepted) {
    return (
      <Disclaimer
        title="Legal Disclaimer"
        content={<LegalDisclaimerContent withTitle={false} />}
        onAccept={onAccept}
        buttonText="Continue"
      />
    )
  }

  if (!isSwapFeatureEnabled) {
    return (
      <Container>
        <Grid container justifyContent="center">
          <div>Swaps are not supported on this chain</div>
        </Grid>
      </Container>
    )
  }

  return (
    <Box className={css.swapWidget} id="swapWidget">
      <CowSwapWidget params={params} listeners={listeners} />
    </Box>
  )
}

export default SwapWidget
