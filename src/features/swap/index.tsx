import { FEATURES } from '@/utils/chains'
import { CowSwapWidget } from '@cowprotocol/widget-react'
import { type CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-lib'
import { CowEvents, type CowEventListeners } from '@cowprotocol/events'
import { useState, useEffect, type MutableRefObject, useMemo } from 'react'
import { Container, Grid, useTheme } from '@mui/material'
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
import { useAppDispatch, useAppSelector } from '@/store'

import css from './styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import BlockedAddress from '@/components/common/BlockedAddress'
import useSwapConsent from './useSwapConsent'
import Disclaimer from '@/components/common/Disclaimer'
import LegalDisclaimerContent from '@/components/common/LegalDisclaimerContent'
import { isBlockedAddress } from '@/services/ofac'
import { selectSwapParams, setSwapParams, type SwapState } from './store/swapParamsSlice'
import { setSwapOrder } from '@/store/swapOrderSlice'
import useChainId from '@/hooks/useChainId'

const BASE_URL = typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''

type Params = {
  sell?: {
    asset: string
    amount: string
  }
}

export const SWAP_TITLE = 'Safe Swap'

export const getSwapTitle = (tradeType: SwapState['tradeType']) => {
  return tradeType === 'limit' ? 'Limit order' : 'Swap order'
}

const SwapWidget = ({ sell }: Params) => {
  const { palette } = useTheme()
  const darkMode = useDarkMode()
  const chainId = useChainId()
  const dispatch = useAppDispatch()
  const isSwapFeatureEnabled = useHasFeature(FEATURES.NATIVE_SWAPS)
  const swapParams = useAppSelector(selectSwapParams)
  const { tradeType } = swapParams
  const { safeAddress, safeLoading } = useSafeInfo()
  const [blockedAddress, setBlockedAddress] = useState('')
  const wallet = useWallet()
  const { isConsentAccepted, onAccept } = useSwapConsent()

  useEffect(() => {
    if (isBlockedAddress(safeAddress)) {
      setBlockedAddress(safeAddress)
    }
    if (wallet?.address && isBlockedAddress(wallet.address)) {
      setBlockedAddress(wallet.address)
    }
  }, [safeAddress, wallet?.address])

  const appData: SafeAppData = useMemo(
    () => ({
      id: 1,
      url: 'https://app.safe.global',
      name: SWAP_TITLE,
      iconUrl: darkMode ? './images/common/safe-swap-dark.svg' : './images/common/safe-swap.svg',
      description: 'Safe Apps',
      chainIds: ['1', '100'],
      accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
      tags: ['safe-apps'],
      features: [SafeAppFeatures.BATCHED_TRANSACTIONS],
      socialProfiles: [],
    }),
    [darkMode],
  )

  const listeners = useMemo<CowEventListeners>(() => {
    return [
      {
        event: CowEvents.ON_TOAST_MESSAGE,
        handler: (event) => {
          console.info('[Swaps] message:', event)
          const { messageType } = event

          switch (messageType) {
            case 'ORDER_CREATED':
              dispatch(
                setSwapOrder({
                  orderUid: event.data.orderUid,
                  status: 'created',
                }),
              )
              break
            case 'ORDER_PRESIGNED':
              dispatch(
                setSwapOrder({
                  orderUid: event.data.orderUid,
                  status: 'open',
                }),
              )
              break
            case 'ORDER_FULFILLED':
              dispatch(
                setSwapOrder({
                  orderUid: event.data.orderUid,
                  status: 'fulfilled',
                }),
              )
              break
            case 'ORDER_EXPIRED':
              dispatch(
                setSwapOrder({
                  orderUid: event.data.orderUid,
                  status: 'expired',
                }),
              )
              break
            case 'ORDER_CANCELLED':
              dispatch(
                setSwapOrder({
                  orderUid: event.data.orderUid,
                  status: 'cancelled',
                }),
              )
              break
          }
        },
      },
      {
        event: CowEvents.ON_CHANGE_TRADE_PARAMS,
        handler: (newTradeParams) => {
          const { orderType: tradeType, recipient } = newTradeParams
          dispatch(setSwapParams({ tradeType }))

          if (recipient && isBlockedAddress(recipient)) {
            setBlockedAddress(recipient)
          }
        },
      },
    ]
  }, [dispatch])

  const [params, setParams] = useState<CowSwapWidgetParams | null>(null)
  useEffect(() => {
    setParams({
      appCode: 'Safe Wallet Swaps', // Name of your app (max 50 characters)
      width: '100%', // Width in pixels (or 100% to use all available space)
      height: '860px',
      chainId,
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
      tradeType, // TradeType.SWAP or TradeType.LIMIT
      sell: sell
        ? sell
        : {
            asset: '',
            amount: '0',
          },
      images: {
        emptyOrders: darkMode
          ? BASE_URL + '/images/common/swap-empty-dark.svg'
          : BASE_URL + '/images/common/swap-empty-light.svg',
      },
      enabledTradeTypes: [TradeType.SWAP, TradeType.LIMIT],
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
      content: {
        feeLabel: 'No fee for one month',
        feeTooltipMarkdown:
          'Any future transaction fee incurred by Cow Protocol here will contribute to a license fee that supports the Safe Community. Neither Safe Ecosystem Foundation nor Core Contributors GmbH operate the CoW Swap Widget and/or Cow Swap.',
      },
    })
  }, [sell, palette, darkMode, tradeType, chainId])

  const chain = useCurrentChain()

  const iframeRef: MutableRefObject<HTMLIFrameElement | null> = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const iframeElement = document.querySelector('#swapWidget iframe')
    if (iframeElement) {
      iframeRef.current = iframeElement as HTMLIFrameElement
    }
  }, [params, isConsentAccepted, safeLoading])

  useCustomAppCommunicator(iframeRef, appData, chain)

  if (!params) {
    return null
  }

  if (blockedAddress) {
    return <BlockedAddress address={blockedAddress} />
  }

  if (!isConsentAccepted) {
    return (
      <Disclaimer
        title="Legal Disclaimer"
        content={<LegalDisclaimerContent withTitle={false} isSafeApps={false} />}
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
