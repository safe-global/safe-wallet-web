import { useState, useCallback, useEffect } from 'react'
import type { SignClientTypes } from 'walletconnect-v2-types'
import { type Web3WalletTypes } from '@walletconnect/web3wallet'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeWalletProvider from '@/safe-wallet-provider/useSafeWalletProvider'
import { WalletConnect } from './WalletConnect'

const EVMBasedNamespaces: string = 'eip155'

// see https://docs.walletconnect.com/2.0/specs/sign/error-codes
const UNSUPPORTED_CHAIN_ERROR_CODE = 5100
const INVALID_METHOD_ERROR_CODE = 1001
const USER_REJECTED_REQUEST_CODE = 4001

export const errorLabel =
  'We were unable to create a connection due to compatibility issues with the latest WalletConnect v2 upgrade. We are actively working with the WalletConnect team and the dApps to get these issues resolved. Use Safe Apps instead wherever possible.'

export type wcConnectType = (uri: string) => Promise<void>
export type wcDisconnectType = () => Promise<void>

export type useWalletConnectType = {
  wcClientData: SignClientTypes.Metadata | undefined
  wcConnect: wcConnectType
  wcDisconnect: wcDisconnectType
  wcApproveSession: () => Promise<void>
  error: string | undefined
  sessionProposal: Web3WalletTypes.SessionProposal | undefined
  wcState: WC_CONNECT_STATE
  acceptInvalidSession: () => void
}

export enum WC_CONNECT_STATE {
  NOT_CONNECTED,
  PAIRING_SESSION,
  PENDING_SESSION_REQUEST,
  APPROVING_SESSION,
  APPROVE_INVALID_SESSION,
  REJECTING_SESSION,
  CONNECTED,
}

const useWalletConnect = (): useWalletConnectType => {
  const [sessionProposal, setSessionProposal] = useState<Web3WalletTypes.SessionProposal>()
  const [wcState, setWcState] = useState<WC_CONNECT_STATE>(WC_CONNECT_STATE.NOT_CONNECTED)
  const [error, setError] = useState<string>()

  const chainInfo = useCurrentChain()
  const { safe } = useSafeInfo()

  const [walletConnect, setWalletConnect] = useState<WalletConnect>()

  const safeWalletProvider = useSafeWalletProvider()

  const currentSessionTopic = walletConnect?.getSessionTopic()

  // Initialize
  useEffect(() => {
    if (!walletConnect) {
      setWalletConnect(new WalletConnect(safe))
    }
  }, [safe, walletConnect])

  // If connected Safe / chain changes we have to update the session
  useEffect(() => {
    if (!walletConnect) {
      return
    }

    walletConnect.updateSafeInfo(safe)
  }, [safe.address.value, safe.chainId, safe, walletConnect])

  useEffect(() => {
    console.log('Trying to register')
    if (!walletConnect || !safeWalletProvider) {
      return
    }
    console.log('Registering session request handler', currentSessionTopic)
    return walletConnect.onSessionRequest(async (event) => {
      const { topic, id } = event
      const { request, chainId: transactionChainId } = event.params

      const isSafeChainId = transactionChainId === `${EVMBasedNamespaces}:${safe.chainId}`

      // we only accept transactions from the Safe chain
      if (!isSafeChainId) {
        const errorMessage = `Transaction rejected: the connected Dapp is not set to the correct chain. Make sure the Dapp only uses ${chainInfo?.chainName} to interact with this Safe.`
        setError(errorMessage)
        await walletConnect.sendSessionResponse({
          topic,
          response: rejectResponse(id, UNSUPPORTED_CHAIN_ERROR_CODE, errorMessage),
        })
        return
      }

      try {
        setError(undefined)
        const result = await safeWalletProvider.request(request)
        await walletConnect.sendSessionResponse({
          topic,
          response: {
            id,
            jsonrpc: '2.0',
            result,
          },
        })

        // TODO TRACKING
        // trackEvent(TRANSACTION_CONFIRMED_ACTION, WALLET_CONNECT_VERSION_2, wcSession.peer.metadata)
      } catch (error: any) {
        setError(error?.message)
        const isUserRejection = error?.message?.includes?.('Transaction was rejected')
        const code = isUserRejection ? USER_REJECTED_REQUEST_CODE : INVALID_METHOD_ERROR_CODE
        await walletConnect.sendSessionResponse({
          topic,
          response: rejectResponse(id, code, error.message),
        })
      }
    })
  }, [chainInfo?.chainName, safe.chainId, safeWalletProvider, walletConnect, currentSessionTopic])

  // we set here the events & restore an active previous session
  useEffect(() => {
    walletConnect?.restoreExistingConnection()

    if (walletConnect?.isConnected()) {
      setWcState(WC_CONNECT_STATE.CONNECTED)
    }
  }, [walletConnect])

  useEffect(() => {
    // events
    return walletConnect?.onSessionProposal(async (proposal) => {
      setSessionProposal(proposal)
      setWcState(WC_CONNECT_STATE.PENDING_SESSION_REQUEST)
    })
  }, [safe, chainInfo, walletConnect])

  useEffect(() => {
    return walletConnect?.onSessionDelete(async () => {
      walletConnect.resetSession()
      setWcState(WC_CONNECT_STATE.NOT_CONNECTED)
      setError(undefined)
    })
  }, [walletConnect])

  const wcConnect = useCallback<wcConnectType>(
    async (uri: string) => {
      await walletConnect?.connect(uri)
      setWcState(WC_CONNECT_STATE.PAIRING_SESSION)
    },
    [walletConnect],
  )

  const wcApproveSession = useCallback(async () => {
    if (!sessionProposal || !walletConnect) {
      throw new Error('Cannot approve session without pending session proposal')
    }

    await walletConnect.approveSessionProposal(sessionProposal, () => {
      setWcState(WC_CONNECT_STATE.APPROVE_INVALID_SESSION)
    })

    setSessionProposal(undefined)
    setError(undefined)
    setWcState(WC_CONNECT_STATE.CONNECTED)
  }, [sessionProposal, walletConnect])

  const acceptInvalidSession = useCallback(() => {
    setWcState(WC_CONNECT_STATE.CONNECTED)
    setError(undefined)
    setSessionProposal(undefined)
  }, [])

  const wcDisconnect = useCallback<wcDisconnectType>(async () => {
    if (!walletConnect) {
      throw new Error('WalletConnect is not initialized')
    }
    await walletConnect?.disconnect()
    setWcState(WC_CONNECT_STATE.NOT_CONNECTED)
    setError(undefined)
  }, [walletConnect])

  const wcClientData = walletConnect?.getMetadata()

  return {
    wcConnect,
    wcClientData,
    wcDisconnect,
    wcApproveSession,
    error,
    wcState,
    sessionProposal,
    acceptInvalidSession,
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
