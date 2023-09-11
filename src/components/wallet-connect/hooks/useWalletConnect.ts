import { useState, useCallback, useEffect } from 'react'
import type { SignClientTypes, SessionTypes } from '@walletconnect/types'
import { Core } from '@walletconnect/core'
import Web3WalletType, { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { IS_PRODUCTION, WALLETCONNECT_V2_PROJECT_ID } from '@/config/constants'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'

const EVMBasedNamespaces: string = 'eip155'

// see full list here: https://github.com/safe-global/safe-apps-sdk/blob/main/packages/safe-apps-provider/src/provider.ts#L35
export const compatibleSafeMethods: string[] = [
  'eth_accounts',
  'net_version',
  'eth_chainId',
  'personal_sign',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v4',
  'eth_sendTransaction',
  'eth_blockNumber',
  'eth_getBalance',
  'eth_getCode',
  'eth_getTransactionCount',
  'eth_getStorageAt',
  'eth_getBlockByNumber',
  'eth_getBlockByHash',
  'eth_getTransactionByHash',
  'eth_getTransactionReceipt',
  'eth_estimateGas',
  'eth_call',
  'eth_getLogs',
  'eth_gasPrice',
  'wallet_getPermissions',
  'wallet_requestPermissions',
  'safe_setSettings',
]

// see https://docs.walletconnect.com/2.0/specs/sign/error-codes
const UNSUPPORTED_CHAIN_ERROR_CODE = 5100
const INVALID_METHOD_ERROR_CODE = 1001
const USER_REJECTED_REQUEST_CODE = 4001
const USER_DISCONNECTED_CODE = 6000

const logger = IS_PRODUCTION ? undefined : 'debug'

export const errorLabel =
  'We were unable to create a connection due to compatibility issues with the latest WalletConnect v2 upgrade. We are actively working with the WalletConnect team and the dApps to get these issues resolved. Use Safe Apps instead wherever possible.'

export type wcConnectType = (uri: string) => Promise<void>
export type wcDisconnectType = () => Promise<void>

export type useWalletConnectType = {
  wcClientData: SignClientTypes.Metadata | undefined
  wcConnect: wcConnectType
  wcDisconnect: wcDisconnectType
  wcApproveSession: () => Promise<void>
  isWallectConnectInitialized: boolean
  error: string | undefined
  sessionProposal: Web3WalletTypes.SessionProposal | undefined
  wcState: WC_CONNECT_STATE
}

// MOVE TO CONSTANTS
export const SAFE_WALLET_METADATA = {
  name: 'Safe Wallet',
  description: 'The most trusted platform to manage digital assets on Ethereum',
  url: 'https://app.safe.global',
  icons: ['https://app.safe.global/favicons/mstile-150x150.png', 'https://app.safe.global/favicons/logo_120x120.png'],
}

export enum WC_CONNECT_STATE {
  NOT_CONNECTED,
  PAIRING_SESSION,
  PENDING_SESSION_REQUEST,
  APPROVING_SESSION,
  REJECTING_SESSION,
  CONNECTED,
}

const useWalletConnect = (): useWalletConnectType => {
  const [web3wallet, setWeb3wallet] = useState<Web3WalletType>()
  const [sessionProposal, setSessionProposal] = useState<Web3WalletTypes.SessionProposal>()
  const [wcState, setWcState] = useState<WC_CONNECT_STATE>(WC_CONNECT_STATE.NOT_CONNECTED)
  const [wcSession, setWcSession] = useState<SessionTypes.Struct>()
  const [isWallectConnectInitialized, setIsWallectConnectInitialized] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const chainInfo = useCurrentChain()
  const { safe } = useSafeInfo()

  // Initializing v2, see https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage
  useEffect(() => {
    const initializeWalletConnectV2Client = async () => {
      const core = new Core({
        projectId: WALLETCONNECT_V2_PROJECT_ID,
        logger,
      })

      const web3wallet = await Web3Wallet.init({
        core,
        metadata: SAFE_WALLET_METADATA,
      })

      setWeb3wallet(web3wallet)
    }

    try {
      initializeWalletConnectV2Client()
    } catch (error) {
      console.log('Error on walletconnect version 2 initialization: ', error)
      setIsWallectConnectInitialized(true)
    }
  }, [])

  // session_request needs to be a separate Effect because a valid wcSession should be present
  useEffect(() => {
    if (!isWallectConnectInitialized || !web3wallet || !wcSession) {
      return
    }
    web3wallet.on('session_request', async (event) => {
      const { topic, id } = event
      const { request, chainId: transactionChainId } = event.params
      const { method, params } = request

      const isSafeChainId = transactionChainId === `${EVMBasedNamespaces}:${safe.chainId}`

      // we only accept transactions from the Safe chain
      if (!isSafeChainId) {
        const errorMessage = `Transaction rejected: the connected Dapp is not set to the correct chain. Make sure the Dapp only uses ${chainInfo?.chainName} to interact with this Safe.`
        setError(errorMessage)
        await web3wallet.respondSessionRequest({
          topic,
          response: rejectResponse(id, UNSUPPORTED_CHAIN_ERROR_CODE, errorMessage),
        })
        return
      }

      try {
        setError(undefined)
        // Handle request
        /* const result = await web3Provider.send(method, params)
        await web3wallet.respondSessionRequest({
          topic,
          response: {
            id,
            jsonrpc: '2.0',
            result,
          },
        })
        */
        // TODO TRACKING
        // trackEvent(TRANSACTION_CONFIRMED_ACTION, WALLET_CONNECT_VERSION_2, wcSession.peer.metadata)
      } catch (error: any) {
        setError(error?.message)
        const isUserRejection = error?.message?.includes?.('Transaction was rejected')
        const code = isUserRejection ? USER_REJECTED_REQUEST_CODE : INVALID_METHOD_ERROR_CODE
        await web3wallet.respondSessionRequest({
          topic,
          response: rejectResponse(id, code, error.message),
        })
      }
    })
  }, [chainInfo, wcSession, isWallectConnectInitialized, web3wallet, safe])

  // we set here the events & restore an active previous session
  useEffect(() => {
    if (!isWallectConnectInitialized && web3wallet) {
      // we try to find a compatible active session
      const activeSessions = web3wallet.getActiveSessions()
      const compatibleSession = Object.keys(activeSessions)
        .map((topic) => activeSessions[topic])
        .find(
          (session) =>
            session.namespaces[EVMBasedNamespaces].accounts[0] ===
            `${EVMBasedNamespaces}:${safe.chainId}:${safe.address.value}`, // Safe Account
        )

      if (compatibleSession) {
        setWcSession(compatibleSession)
        setWcState(WC_CONNECT_STATE.CONNECTED)
      }

      // events
      web3wallet.on('session_proposal', async (proposal) => {
        setSessionProposal(proposal)
        setWcState(WC_CONNECT_STATE.PENDING_SESSION_REQUEST)
      })

      web3wallet.on('session_delete', async () => {
        setWcState(WC_CONNECT_STATE.NOT_CONNECTED)
        setWcSession(undefined)
        setError(undefined)
      })

      setIsWallectConnectInitialized(true)
    }
  }, [safe, web3wallet, isWallectConnectInitialized, chainInfo])

  const wcConnect = useCallback<wcConnectType>(
    async (uri: string) => {
      const isValidWalletConnectUri = uri && uri.startsWith('wc')

      if (isValidWalletConnectUri && web3wallet) {
        setWcState(WC_CONNECT_STATE.PAIRING_SESSION)
        await web3wallet.core.pairing.pair({ uri })
      }
    },
    [web3wallet],
  )

  const wcApproveSession = useCallback(async () => {
    if (!sessionProposal || !web3wallet) {
      throw new Error('Cannot approve session without pending session proposal')
    }

    const { id, params } = sessionProposal
    const { requiredNamespaces } = params
    const requiredNamespace = requiredNamespaces[EVMBasedNamespaces]

    const safeChain = `${EVMBasedNamespaces}:${safe.chainId}`
    const safeEvents = requiredNamespace?.events || [] // we accept all events like chainChanged & accountsChanged (even if they are not compatible with the Safe)

    const requiredChains = [...(requiredNamespace.chains ?? [])]
    // If the user accepts we always return all required namespaces and add the safe chain to it
    const safeAccount = `${EVMBasedNamespaces}:${safe.chainId}:${safe.address.value}`

    // We first fake that our Safe is available on all required networks
    const safeOnRequiredChains = requiredChains.map(
      (requiredChain) => `${requiredChains[0] ?? safeChain}:${safe.address.value}`,
    )
    const wcSession = await web3wallet.approveSession({
      id,
      namespaces: {
        eip155: {
          accounts: safeOnRequiredChains.includes(safeAccount)
            ? safeOnRequiredChains
            : [...safeOnRequiredChains, safeAccount], // only the Safe account
          chains: requiredChains, // only the Safe chain
          methods: compatibleSafeMethods, // only the Safe methods
          events: safeEvents,
        },
      },
    })

    // Then we update the session and reduce the Safe to the requested network only
    if (!safeOnRequiredChains.includes(safeAccount) || safeOnRequiredChains.length > 1) {
      if (!requiredChains.includes(safeChain)) {
        requiredChains.push(safeChain)
      }

      // Emit accountsChanged and chainChanged event
      await web3wallet.updateSession({
        topic: wcSession.topic,
        namespaces: {
          eip155: {
            accounts: [safeAccount],
            chains: requiredChains,
            methods: compatibleSafeMethods,
            events: safeEvents,
          },
        },
      })
    }

    //
    setWcSession(wcSession)
    setSessionProposal(undefined)
    setError(undefined)
    setWcState(WC_CONNECT_STATE.CONNECTED)
  }, [safe.address, safe.chainId, sessionProposal, web3wallet])

  const wcDisconnect = useCallback<wcDisconnectType>(async () => {
    if (wcSession && web3wallet) {
      await web3wallet.disconnectSession({
        topic: wcSession.topic,
        reason: {
          code: USER_DISCONNECTED_CODE,
          message: 'User disconnected. Safe Wallet Session ended by the user',
        },
      })
      setWcState(WC_CONNECT_STATE.NOT_CONNECTED)

      setWcSession(undefined)
      setError(undefined)
    }
  }, [web3wallet, wcSession])

  const wcClientData = wcSession?.peer.metadata

  return {
    wcConnect,
    wcClientData,
    wcDisconnect,
    wcApproveSession,
    isWallectConnectInitialized,
    error,
    wcState,
    sessionProposal,
  }
}

export default useWalletConnect

const rejectResponse = (id: number, code: number, message: string) => {
  return {
    id,
    jsonrpc: '2.0',
    error: {
      code,
      message,
    },
  }
}
