// Be careful what you import here as it will increase the service worker bundle size

import { get as getFromIndexedDb } from 'idb-keyval'
import { formatUnits } from '@ethersproject/units' // Increases bundle significantly but unavoidable
import type { ChainInfo, ChainListResponse, SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import type { MessagePayload } from 'firebase/messaging'

import { AppRoutes } from '@/config/routes' // Has no internal imports
import { isWebhookEvent, WebhookType } from './webhooks'
import { getSafeNotificationPrefsKey, createNotificationPrefsIndexedDb } from './preferences'
import { FIREBASE_IS_PRODUCTION } from './app'
import type { WebhookEvent } from './webhooks'
import type { NotificationPreferences, SafeNotificationPrefsKey } from './preferences'

const shortenAddress = (address: string, length = 4): string => {
  if (!address) {
    return ''
  }

  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

export const shouldShowNotification = async (payload: MessagePayload): Promise<boolean> => {
  if (!isWebhookEvent(payload.data)) {
    return true
  }

  const { chainId, address, type } = payload.data

  const key = getSafeNotificationPrefsKey(chainId, address)
  const store = createNotificationPrefsIndexedDb()

  const preferencesStore = await getFromIndexedDb<NotificationPreferences[SafeNotificationPrefsKey]>(key, store).catch(
    () => null,
  )

  if (!preferencesStore) {
    return false
  }

  return preferencesStore.preferences[type]
}

const GATEWAY_URL_PRODUCTION = process.env.NEXT_PUBLIC_GATEWAY_URL_PRODUCTION || 'https://safe-client.safe.global'
const GATEWAY_URL_STAGING = process.env.NEXT_PUBLIC_GATEWAY_URL_STAGING || 'https://safe-client.staging.5afe.dev'

// localStorage cannot be accessed in service workers so we reference the flag from the environment
const GATEWAY_URL = FIREBASE_IS_PRODUCTION ? GATEWAY_URL_PRODUCTION : GATEWAY_URL_STAGING

// XHR is not supported in service workers so we can't use the SDK
// TODO: Migrate to SDK when we update it to use fetch
const getChain = async (chainId: string): Promise<ChainInfo | undefined> => {
  const ENDPOINT = `${GATEWAY_URL}/v1/chains`

  let chains: ChainListResponse | null = null

  try {
    const response = await fetch(ENDPOINT)
    if (response.ok) {
      chains = await response.json()
    }
  } catch {}

  return chains?.results.find((chain) => chain.chainId === chainId)
}

const getTokenInfo = async (
  chainId: string,
  safeAddress: string,
  tokenAddress: string,
  tokenValue?: string,
): Promise<{ symbol: string; value: string; name: string }> => {
  const DEFAULT_CURRENCY = 'USD'
  const ENDPOINT = `${GATEWAY_URL}/v1/chains/${chainId}/safes/${safeAddress}/balances/${DEFAULT_CURRENCY}`

  const DEFAULT_INFO = {
    symbol: 'tokens',
    value: 'some',
    name: 'Token',
  }

  let balances: SafeBalanceResponse | null = null

  try {
    const response = await fetch(ENDPOINT)
    if (response.ok) {
      balances = await response.json()
    }
  } catch {}

  const tokenInfo = balances?.items.find((token) => token.tokenInfo.address === tokenAddress)?.tokenInfo

  if (!tokenInfo) {
    return DEFAULT_INFO
  }

  const symbol = tokenInfo?.symbol ?? DEFAULT_INFO.symbol
  const value = tokenValue && tokenInfo ? formatUnits(tokenValue, tokenInfo.decimals).toString() : DEFAULT_INFO.value
  const name = tokenInfo?.name ?? DEFAULT_INFO.name

  return {
    symbol,
    value,
    name,
  }
}

const getLink = (data: WebhookEvent, shortName?: string) => {
  const URL = self.location.origin

  if (!shortName) {
    return URL
  }

  const withRoute = (route: string) => {
    return `${URL}${route}?safe=${shortName}:${data.address}`
  }

  if ('safeTxHash' in data) {
    return `${withRoute(AppRoutes.transactions.tx)}&id=${data.safeTxHash}`
  }

  return withRoute(AppRoutes.transactions.history)
}

type NotificationsMap<T extends WebhookEvent = WebhookEvent> = {
  [P in T['type']]: (
    data: Extract<T, { type: P }>,
  ) => Promise<{ title: string; body: string }> | { title: string; body: string } | null
}

export const _parseWebhookNotification = async (
  data: WebhookEvent,
): Promise<{ title: string; body: string; link: string } | undefined> => {
  let chain: ChainInfo | undefined

  try {
    chain = await getChain(data.chainId)
  } catch {}

  const chainName = chain?.chainName ?? `chain ${data.chainId}`

  const currencySymbol = chain?.nativeCurrency?.symbol ?? 'ETH'
  const currencyName = chain?.nativeCurrency?.name ?? 'Ether'

  const Notifications: NotificationsMap = {
    [WebhookType.NEW_CONFIRMATION]: ({ address, owner, safeTxHash }) => {
      return {
        title: 'Transaction confirmation',
        body: `Safe ${shortenAddress(address)} on ${chainName} has a new confirmation from ${shortenAddress(
          owner,
        )} on transaction ${shortenAddress(safeTxHash)}.`,
      }
    },
    [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: ({ address, failed, txHash }) => {
      const didFail = failed === 'true'
      return {
        title: `Transaction ${didFail ? 'failed' : 'executed'}`,
        body: `Safe ${shortenAddress(address)} on ${chainName} ${
          didFail ? 'failed to execute' : 'executed'
        } transaction ${shortenAddress(txHash)}.`,
      }
    },
    [WebhookType.PENDING_MULTISIG_TRANSACTION]: ({ address, safeTxHash }) => {
      return {
        title: 'Pending transaction',
        body: `Safe ${shortenAddress(address)} on ${chainName} has a pending transaction ${shortenAddress(
          safeTxHash,
        )}.`,
      }
    },
    [WebhookType.INCOMING_ETHER]: ({ address, txHash, value }) => {
      return {
        title: `${currencyName} received`,
        body: `Safe ${shortenAddress(address)} on ${chainName} received ${formatUnits(
          value,
          chain?.nativeCurrency?.decimals,
        ).toString()} ${currencySymbol} in transaction ${shortenAddress(txHash)}.`,
      }
    },
    [WebhookType.OUTGOING_ETHER]: ({ address, txHash, value }) => {
      return {
        title: `${currencyName} sent`,
        body: `Safe ${shortenAddress(address)} on ${chainName} sent ${formatUnits(
          value,
          chain?.nativeCurrency?.decimals,
        ).toString()} ${currencySymbol} in transaction ${shortenAddress(txHash)}.`,
      }
    },
    [WebhookType.INCOMING_TOKEN]: async ({ address, txHash, tokenAddress, value }) => {
      const token = await getTokenInfo(data.chainId, address, tokenAddress, value)
      return {
        title: `${token.name} received`,
        body: `Safe ${shortenAddress(address)} on ${chainName} received ${token.value} ${
          token.symbol
        } in transaction ${shortenAddress(txHash)}.`,
      }
    },
    [WebhookType.OUTGOING_TOKEN]: async ({ address, txHash, tokenAddress, value }) => {
      const token = await getTokenInfo(data.chainId, address, tokenAddress, value)
      return {
        title: `${token.name} sent`,
        body: `Safe ${shortenAddress(address)} on ${chainName} sent ${token.value} ${
          token.symbol
        } in transaction ${shortenAddress(txHash)}.`,
      }
    },
    [WebhookType.MODULE_TRANSACTION]: ({ address, module, txHash }) => {
      return {
        title: 'Module transaction',
        body: `Safe ${shortenAddress(address)} on ${chainName} executed a module transaction ${shortenAddress(
          txHash,
        )} from module ${shortenAddress(module)}.`,
      }
    },
    [WebhookType.CONFIRMATION_REQUEST]: ({ address, safeTxHash }) => {
      return {
        title: 'Confirmation request',
        body: `Safe ${shortenAddress(
          address,
        )} on ${chainName} has a new confirmation request for transaction ${shortenAddress(safeTxHash)}.`,
      }
    },
    [WebhookType.SAFE_CREATED]: () => {
      // We do not preemptively subscribe to Safes before they are created
      return null
    },
  }

  // Can be safely casted as `data.type` is a mapped type of `NotificationsMap`
  const notification = await Notifications[data.type](data as any)

  if (notification) {
    return {
      ...notification,
      link: getLink(data, chain?.shortName),
    }
  }
}

export const parseFirebaseNotification = async (
  payload: MessagePayload,
): Promise<({ title: string; link?: string } & NotificationOptions) | undefined> => {
  // Transaction Service-dispatched notification
  if (isWebhookEvent(payload.data)) {
    const webhookNotification = await _parseWebhookNotification(payload.data)

    if (webhookNotification) {
      return {
        title: webhookNotification.title,
        body: webhookNotification.body,
        link: webhookNotification.link,
      }
    }
  }

  // Manually dispatched notifications from the Firebase admin panel
  // Displayed as is
  if (payload.notification) {
    return {
      title: payload.notification.title || '',
      body: payload.notification.body,
      image: payload.notification.image,
    }
  }
}
