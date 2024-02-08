import { type CowSwapWidgetParams, TradeType, CowSwapWidget } from '@cowprotocol/widget-react'
import { useState, useEffect, useContext, type MutableRefObject } from 'react'
import { Container, Grid, useTheme } from '@mui/material'
import useChainId from '@/hooks/useChainId'
import { useRef } from 'react'
import { Box } from '@mui/material'
import useAppCommunicator, { CommunicatorMessages } from '@/components/safe-apps/AppFrame/useAppCommunicator'
import {
  type AddressBookItem,
  type BaseTransaction,
  type EIP712TypedData,
  Methods,
  type RequestId,
  type SafeSettings,
  type SendTransactionRequestParams,
} from '@safe-global/safe-apps-sdk'
import { SafeAppsTxFlow, SignMessageFlow, SignMessageOnChainFlow } from '@/components/tx-flow/flows'
import { isOffchainEIP1271Supported } from '@/utils/safe-messages'
import { getBalances, getSafeMessage, getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import useGetSafeInfo from '@/components/safe-apps/AppFrame/useGetSafeInfo'
import { FEATURES, hasFeature } from '@/utils/chains'
import { isSafeMessageListItem } from '@/utils/safe-message-guards'
import {
  SafeAppAccessPolicyTypes,
  type SafeAppData,
  SafeAppFeatures,
} from '@safe-global/safe-gateway-typescript-sdk/dist/types/safe-apps'
import { useCurrentChain } from '@/hooks/useChains'
import { TxModalContext } from '@/components/tx-flow'
import { selectTokenList, selectOnChainSigning, TOKEN_LISTS } from '@/store/settingsSlice'
import { useAppSelector } from '@/store'
import useAddressBook from '@/hooks/useAddressBook'
import useTransactionQueueBarState from '@/components/safe-apps/AppFrame/useTransactionQueueBarState'
import useSafeInfo from '@/hooks/useSafeInfo'
import { selectSafeMessages } from '@/store/safeMessagesSlice'
import { useSafePermissions } from '@/hooks/safe-apps/permissions'
import { useDarkMode } from '@/hooks/useDarkMode'
import { type SafeAppsTxParams } from '../tx-flow/flows/SafeAppsTx'
import { trackSafeAppEvent, SAFE_APPS_EVENTS } from '@/services/analytics'
import { safeMsgSubscribe, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import { txSubscribe, TxEvent } from '@/services/tx/txEvents'

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
  console.log('sell', sell)
  const { safe, safeLoaded, safeAddress } = useSafeInfo()

  const chainId = useChainId()
  const [currentRequestId, setCurrentRequestId] = useState<RequestId | undefined>()
  const safeMessages = useAppSelector(selectSafeMessages)

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

  const addressBook = useAddressBook()

  const {
    expanded: queueBarExpanded,
    dismissedByUser: queueBarDismissed,
    setExpanded,
    dismissQueueBar,
    transactions,
  } = useTransactionQueueBarState()

  const { getPermissions, hasPermission, permissionsRequest, setPermissionsRequest, confirmPermissionRequest } =
    useSafePermissions()
  const [settings, setSettings] = useState<SafeSettings>({
    offChainSigning: true,
  })
  const tokenlist = useAppSelector(selectTokenList)
  const onChainSigning = useAppSelector(selectOnChainSigning)

  const { setTxFlow } = useContext(TxModalContext)

  const onTxFlowClose = () => {
    setCurrentRequestId((prevId) => {
      if (prevId) {
        communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, prevId, true)
        // trackSafeAppEvent(SAFE_APPS_EVENTS.PROPOSE_TRANSACTION_REJECTED, appName)
      }
      return undefined
    })
  }

  const iframeRef: MutableRefObject<HTMLIFrameElement | null | undefined> = useRef<HTMLIFrameElement | null>()

  useEffect(() => {
    const iframeElement = document.querySelector('#swapWidget iframe')
    if (iframeElement) {
      iframeRef.current = iframeElement as HTMLIFrameElement
    }
  }, [params])

  const communicator = useAppCommunicator(iframeRef, appData, chain, {
    onConfirmTransactions: (txs: BaseTransaction[], requestId: RequestId, params?: SendTransactionRequestParams) => {
      const data: SafeAppsTxParams = {
        app: appData,
        appId: String(appData.id),
        requestId: requestId,
        txs: txs,
        params: params,
      }

      setCurrentRequestId(requestId)
      setTxFlow(<SafeAppsTxFlow data={data} />, onTxFlowClose)
    },
    onSignMessage: (
      message: string | EIP712TypedData,
      requestId: string,
      method: Methods.signMessage | Methods.signTypedMessage,
      sdkVersion: string,
    ) => {
      const isOffChainSigningSupported = isOffchainEIP1271Supported(safe, chain, sdkVersion)
      const signOffChain = isOffChainSigningSupported && !onChainSigning && !!settings.offChainSigning

      setCurrentRequestId(requestId)

      if (signOffChain) {
        setTxFlow(
          <SignMessageFlow
            logoUri={appData?.iconUrl || ''}
            name={appData?.name || ''}
            message={message}
            safeAppId={appData?.id}
            requestId={requestId}
          />,
          onTxFlowClose,
        )
      } else {
        setTxFlow(
          <SignMessageOnChainFlow
            props={{
              app: appData,
              requestId,
              message,
              method,
            }}
          />,
        )
      }
    },
    onGetPermissions: getPermissions,
    onSetPermissions: setPermissionsRequest,
    onRequestAddressBook: (origin: string): AddressBookItem[] => {
      if (hasPermission(origin, Methods.requestAddressBook)) {
        return Object.entries(addressBook).map(([address, name]) => ({ address, name, chainId }))
      }

      return []
    },
    onGetTxBySafeTxHash: (safeTxHash) => getTransactionDetails(chainId, safeTxHash),
    onGetEnvironmentInfo: () => ({
      origin: document.location.origin,
    }),
    onGetSafeInfo: useGetSafeInfo(),
    onGetSafeBalances: (currency) => {
      const isDefaultTokenlistSupported = chain && hasFeature(chain, FEATURES.DEFAULT_TOKENLIST)
      return getBalances(chainId, safeAddress, currency, {
        exclude_spam: true,
        trusted: isDefaultTokenlistSupported && TOKEN_LISTS.TRUSTED === tokenlist,
      })
    },
    onGetChainInfo: () => {
      if (!chain) return

      const { nativeCurrency, chainName, chainId, shortName, blockExplorerUriTemplate } = chain

      return {
        chainName,
        chainId,
        shortName,
        nativeCurrency,
        blockExplorerUriTemplate,
      }
    },
    onSetSafeSettings: (safeSettings: SafeSettings) => {
      const newSettings: SafeSettings = {
        ...settings,
        offChainSigning: !!safeSettings.offChainSigning,
      }

      setSettings(newSettings)

      return newSettings
    },
    onGetOffChainSignature: async (messageHash: string) => {
      const safeMessage = safeMessages.data?.results
        ?.filter(isSafeMessageListItem)
        ?.find((item) => item.messageHash === messageHash)

      if (safeMessage) {
        return safeMessage.preparedSignature
      }

      try {
        const { preparedSignature } = await getSafeMessage(chainId, messageHash)
        return preparedSignature
      } catch {
        return ''
      }
    },
  })

  useEffect(() => {
    const unsubscribe = txSubscribe(TxEvent.SAFE_APPS_REQUEST, async ({ safeAppRequestId, safeTxHash }) => {
      if (safeAppRequestId && currentRequestId === safeAppRequestId) {
        trackSafeAppEvent(SAFE_APPS_EVENTS.PROPOSE_TRANSACTION, appData.name)
        communicator?.send({ safeTxHash }, safeAppRequestId)
      }
    })

    return unsubscribe
  }, [chainId, communicator, currentRequestId])

  useEffect(() => {
    const unsubscribe = safeMsgSubscribe(SafeMsgEvent.SIGNATURE_PREPARED, ({ messageHash, requestId, signature }) => {
      if (requestId && currentRequestId === requestId) {
        communicator?.send({ messageHash, signature }, requestId)
      }
    })

    return unsubscribe
  }, [communicator, currentRequestId])

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
