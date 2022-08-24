import { ReactElement, useCallback, useEffect, useMemo } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { getBalances, getTransactionDetails, SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { isSameUrl } from '@/utils/url'
import { ThirdPartyCookiesWarning } from './ThirdPartyCookiesWarning'
import useThirdPartyCookies from './useThirdPartyCookies'
import useAppIsLoading from './useAppIsLoading'

import css from './styles.module.css'
import { useAppCommunicator } from './useAppCommunicator'
import {
  GetBalanceParams,
  GetTxBySafeTxHashParams,
  Methods,
  RPCPayload,
  SignMessageParams,
} from '@gnosis.pm/safe-apps-sdk'
import { useCurrentChain } from '@/hooks/useChains'
import useIsGranted from '@/hooks/useIsGranted'
import useSafeAddress from '@/hooks/useSafeAddress'
import { getAddress } from 'ethers/lib/utils'
import { createSafeAppsWeb3Provider } from '@/hooks/wallets/web3'

type JsonRpcResponse = {
  jsonrpc: string
  id: number
  result?: any
  error?: string
}

type AppFrameProps = {
  appUrl: string
}

const AppFrame = ({ appUrl }: AppFrameProps): ReactElement => {
  const { safe } = useSafeInfo()
  const safeAddress = useSafeAddress()
  const chain = useCurrentChain()
  const { nativeCurrency, chainId, chainName, shortName, blockExplorerUriTemplate, safeAppsRpcUri } = chain || {}
  const [remoteApps] = useRemoteSafeApps()
  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, safe.chainId)
  const { thirdPartyCookiesDisabled, setThirdPartyCookiesDisabled } = useThirdPartyCookies()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()
  const communicator = useAppCommunicator(iframeRef, safeAppFromManifest)
  const granted = useIsGranted()
  const safeAppWeb3Provider = useMemo(() => {
    if (!chain) {
      return
    }

    return createSafeAppsWeb3Provider(chain)
  }, [chain])

  const remoteApp = useMemo(() => remoteApps?.find((app: SafeAppData) => app.url === appUrl), [remoteApps, appUrl])

  useEffect(() => {
    if (!remoteApp) return

    trackSafeAppOpenCount(remoteApp.id)
  }, [remoteApp])

  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe || !isSameUrl(iframe.src, appUrl)) {
      return
    }

    setAppIsLoading(false)
  }, [appUrl, iframeRef, setAppIsLoading])

  useEffect(() => {
    communicator?.on(Methods.getTxBySafeTxHash, async (msg) => {
      const { safeTxHash } = msg.data.params as GetTxBySafeTxHashParams

      const tx = await getTransactionDetails(chainId || '', safeTxHash)

      return tx
    })

    communicator?.on(Methods.getEnvironmentInfo, async () => ({
      origin: document.location.origin,
    }))

    communicator?.on(Methods.getSafeInfo, () => ({
      safeAddress,
      chainId: parseInt(chainId || '', 10),
      owners: safe.owners.map((owner) => owner.value),
      threshold: safe.threshold,
      isReadOnly: !granted,
    }))

    communicator?.on(Methods.getSafeBalances, async (msg) => {
      const { currency = 'usd' } = msg.data.params as GetBalanceParams

      const balances = getBalances(chainId || '', safeAddress, currency, {
        exclude_spam: true,
        trusted: false,
      })

      return balances
    })

    communicator?.on(Methods.rpcCall, async (msg) => {
      const params = msg.data.params as RPCPayload

      try {
        return await safeAppWeb3Provider?.send(params.call, params.params)
      } catch (err) {
        throw new Error((err as JsonRpcResponse).error)
      }
    })

    communicator?.on(Methods.sendTransactions, (msg) => {
      // @ts-expect-error explore ways to fix this
      const transactions = (msg.data.params.txs as Transaction[]).map(({ to, ...rest }) => ({
        to: getAddress(to),
        ...rest,
      }))
      // // @ts-expect-error explore ways to fix this
      // openConfirmationModal(transactions, msg.data.params.params, msg.data.id)
    })

    communicator?.on(Methods.signMessage, async (msg) => {
      const { message } = msg.data.params as SignMessageParams

      // openSignMessageModal(message, msg.data.id)
    })

    communicator?.on(Methods.getChainInfo, async () => {
      return {
        chainName,
        chainId,
        shortName,
        nativeCurrency,
        blockExplorerUriTemplate,
      }
    })
  }, [
    blockExplorerUriTemplate,
    chainId,
    chainName,
    communicator,
    granted,
    nativeCurrency,
    safe,
    safeAddress,
    safeAppWeb3Provider,
    shortName,
  ])

  return (
    <div className={css.wrapper}>
      {thirdPartyCookiesDisabled && <ThirdPartyCookiesWarning onClose={() => setThirdPartyCookiesDisabled(false)} />}

      {appIsLoading && (
        <div className={css.loadingContainer}>
          {isLoadingSlow && (
            <Typography variant="h4" gutterBottom>
              The Safe App is taking too long to load, consider refreshing.
            </Typography>
          )}
          <CircularProgress size={48} color="primary" />
        </div>
      )}

      <iframe
        className={css.iframe}
        frameBorder="0"
        id={`iframe-${appUrl}`}
        ref={iframeRef}
        src={appUrl}
        title={safeAppFromManifest?.name}
        onLoad={onIframeLoad}
        allow="camera"
        style={{ display: appIsLoading ? 'none' : 'block' }}
      />
    </div>
  )
}

export default AppFrame
