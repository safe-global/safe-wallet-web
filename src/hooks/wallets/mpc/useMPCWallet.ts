import ExternalStore from '@/services/ExternalStore'

import BN from 'bn.js'
import { generatePrivate } from 'eccrypto'
import { getPubKeyPoint, type ShareStore } from '@tkey-mpc/common-types'
import TorusUtils from '@toruslabs/torus.js'
import type ThresholdKey from '@tkey-mpc/core'
import { type TorusStorageLayer } from '@tkey-mpc/storage-layer-torus'

import { useCallback, useEffect, useState } from 'react'
import type { TorusServiceProvider } from '@tkey-mpc/service-provider-torus'
import type { TorusLoginResponse, TorusVerifierResponse, LoginWindowResponse } from '@toruslabs/customauth'
import useMPC from '@/hooks/wallets/mpc/useMPC'
import { utils } from '@toruslabs/tss-client'
import { connectWallet } from '../useOnboard'
import { GOOGLE_CLIENT_ID, WEB3AUTH_VERIFIER_ID } from '@/config/constants'
import { useCurrentChain } from '@/hooks/useChains'
import { getRpcServiceUrl } from '../web3'
import { useDeviceShare } from './recovery/useDeviceShare'
import { usePasswordRecovery } from './recovery/usePasswordRecovery'
import useOnboard from '../useOnboard'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'
import type { Web3Provider } from '@ethersproject/providers'

const { getTSSPubKey } = utils

export const {
  getStore: getMPCProvider,
  setStore: setMPCProvider,
  useStore: useMPCProvider,
} = new ExternalStore<Web3Provider>()

const isMetadataPresent = async (tKey: ThresholdKey, privateKeyBN: BN) => {
  const metadata = (await (tKey.storageLayer as TorusStorageLayer).getMetadata({ privKey: privateKeyBN })) as any
  if (metadata && Object.keys(metadata).length > 0 && metadata.message !== 'KEY_NOT_FOUND') {
    return true
  } else {
    return false
  }
}

export enum MPCWalletState {
  NOT_INITIALIZED,
  AUTHENTICATING,
  AUTHENTICATED,
  CREATING_SECOND_FACTOR,
  RECOVERING_ACCOUNT_PASSWORD,
  CREATED_SECOND_FACTOR,
  FINALIZING_ACCOUNT,
  READY,
}

export const useMPCWallet = () => {
  // Hooks and state
  const [loginResponse, setLoginResponse] = useState<TorusLoginResponse>()
  const [loginPending, setLoginPending] = useState(false)
  const [oAuthShare, setOAuthShare] = useState<BN>()
  const [user, setUser] = useState<TorusVerifierResponse & LoginWindowResponse>()
  const [signingParams, setSigningParams] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState<string>()
  const [walletState, setWalletState] = useState(MPCWalletState.NOT_INITIALIZED)
  const [factorKey, setFactorKey] = useState<BN | null>(null)
  const [createNewMetadata, setCreateNewMetadata] = useState(false)

  const { localFactorKey, setLocalFactorKey, fetchDeviceShare } = useDeviceShare(loginResponse)
  const { recoverPasswordFactorKey, upsertPasswordBackup } = usePasswordRecovery(localFactorKey)
  const tKey = useMPC()
  const chain = useCurrentChain()
  const onboard = useOnboard()

  // sets up web3
  useEffect(() => {
    const localSetup = async () => {
      const { setupWeb3 } = await import('@/hooks/wallets/mpc/utils')

      if (!loginResponse || !chain) {
        return
      }

      const chainConfig = {
        chainId: `0x${Number(chain.chainId).toString(16)}`,
        rpcTarget: getRpcServiceUrl(chain.rpcUri),
        displayName: chain.chainName,
        blockExplorer: chain.blockExplorerUriTemplate.address,
        ticker: chain.nativeCurrency.symbol,
        tickerName: chain.nativeCurrency.name,
      }
      const web3Local = await setupWeb3(chainConfig, loginResponse, signingParams)

      const accountsResponse = await web3Local?.send('eth_accounts', [])
      if (Array.isArray(accountsResponse) && accountsResponse.length > 0) {
        setWalletAddress(accountsResponse[0])
      }

      if (web3Local) {
        setMPCProvider(web3Local)
      }
    }
    if (signingParams) {
      localSetup().then(() => setWalletState(MPCWalletState.READY))
    }
  }, [chain, loginResponse, signingParams, user?.email, walletAddress])

  const resetAccount = async () => {
    if (!loginResponse || !tKey) {
      return
    }
    try {
      localStorage.removeItem(
        `tKeyLocalStore\u001c${loginResponse.userInfo.verifier}\u001c${loginResponse.userInfo.verifierId}`,
      )
      await tKey.storageLayer.setMetadata({
        privKey: oAuthShare,
        input: { message: 'KEY_NOT_FOUND' },
      })
      setUser(undefined)
    } catch (e) {
      console.error(e)
    }
  }

  const validateFactorKey = useCallback(
    async (factorKey: BN): Promise<ShareStore> => {
      if (!tKey) {
        throw new Error('tkey does not exist, cannot add factor pub')
      }
      // Get the corresponding TSS share from metadata using the factorKey
      const factorKeyMetadata = await tKey.storageLayer.getMetadata<{
        message: string
      }>({
        privKey: factorKey,
      })

      // If the metadata doesn't have the TSS Share, the factorKey is invalid
      if (factorKeyMetadata.message === 'KEY_NOT_FOUND') {
        throw new Error('no metadata for your factor key')
      }
      const metadataShare = JSON.parse(factorKeyMetadata.message)
      if (!metadataShare.deviceShare || !metadataShare.tssShare) throw new Error('Invalid data from metadata')

      return metadataShare.deviceShare
    },
    [tKey],
  )

  const finalizeAccountCreation = useCallback(async () => {
    setWalletState(MPCWalletState.FINALIZING_ACCOUNT)
    const { addFactorKeyMetadata, getEcCrypto } = await import('@/hooks/wallets/mpc/utils')
    if (!tKey || !loginResponse || !factorKey) {
      console.error('account creation is not ready')
      return
    }

    // Checks the requiredShares to reconstruct the tKey, starts from 2 by default and each of the above share reduce it by one.
    const { requiredShares } = tKey.getKeyDetails()
    if (requiredShares > 0) {
      throw `Threshold not met. Required Share: ${requiredShares}. You should reset your account.`
    }

    // Reconstruct the Metadata Key
    await tKey.reconstructKey()

    const tssNonce: number = tKey.metadata.tssNonces![tKey.tssTag]
    // tssShare1 = OAuth TSS Share
    const tssShare1PubKeyDetails = await tKey.serviceProvider.getTSSPubKey(tKey.tssTag, tssNonce)
    const tssShare1PubKey = {
      x: tssShare1PubKeyDetails.pubKey.x.toString('hex'),
      y: tssShare1PubKeyDetails.pubKey.y.toString('hex'),
    }

    // tssShare2 = Device TSS Share
    const { tssShare: tssShare2, tssIndex: tssShare2Index } = await tKey.getTSSShare(factorKey)

    const ec = getEcCrypto()
    const tssShare2ECPK = ec.curve.g.mul(tssShare2)
    const tssShare2PubKey = { x: tssShare2ECPK.getX().toString('hex'), y: tssShare2ECPK.getY().toString('hex') }

    // 4. derive tss pub key, tss pubkey is implicitly formed using the dkgPubKey and the userShare (as well as userTSSIndex)
    const tssPubKey = getTSSPubKey(tssShare1PubKey, tssShare2PubKey, tssShare2Index)

    const compressedTSSPubKey = Buffer.from(
      `${tssPubKey.getX().toString(16, 64)}${tssPubKey.getY().toString(16, 64)}`,
      'hex',
    )

    // 5. save factor key and other metadata
    if (createNewMetadata) {
      await addFactorKeyMetadata(tKey, factorKey, tssShare2, tssShare2Index, 'local storage share')
    }
    await tKey.syncLocalMetadataTransitions()

    setLocalFactorKey(factorKey)

    const nodeDetails = await tKey.serviceProvider.getTSSNodeDetails()
    // Filter out the null values from the signatures
    const signatures = loginResponse.sessionData.sessionTokenData
      .filter((i) => Boolean(i))
      .map((session) => JSON.stringify({ data: session.token, sig: session.signature }))

    setSigningParams({
      tssNonce,
      tssShare2,
      tssShare2Index,
      compressedTSSPubKey,
      signatures,
      nodeDetails,
    })

    setLoginPending(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createNewMetadata, factorKey, loginResponse, setLocalFactorKey, tKey, validateFactorKey])

  /**
   * Creates a new factor key pair and device share private key.
   * The public key of the factor key pair is used to encrypt the device share.
   * The encrypted device share gets stored in the torus metadata.
   */
  const initializeNewShare = useCallback(async () => {
    if (!tKey) {
      console.error('tKey not initialized')
      return null
    }

    const factorKey = new BN(generatePrivate())
    const deviceTSSShare = new BN(generatePrivate())
    const deviceTSSIndex = 2
    const factorPub = getPubKeyPoint(factorKey)
    await tKey.initialize({ useTSS: true, factorPub, deviceTSSShare, deviceTSSIndex })
    return factorKey
  }, [tKey])

  const initializeTKeyForExistingUser = useCallback(
    async (factorKey: BN) => {
      if (!tKey) {
        throw new Error('tKey not initialized')
      }
      const metadataDeviceShare = await validateFactorKey(factorKey)

      // Initialize the tKey with the TSS Share from metadata
      await tKey.initialize({ neverInitializeNewKey: true })
      await tKey.inputShareStoreSafe(metadataDeviceShare, true)
    },
    [tKey, validateFactorKey],
  )

  const deriveSecondShare = useCallback(async () => {
    if (!tKey) {
      throw new Error('tKey not initialized')
    }

    if (!oAuthShare || !loginResponse) {
      throw new Error('User not authorized. You need to login first')
    }

    setWalletState(MPCWalletState.CREATING_SECOND_FACTOR)

    // Get the Device Share
    const tKeyLocalStore = fetchDeviceShare()

    // Check if the user is new or existing
    const existingUser = await isMetadataPresent(tKey, oAuthShare)
    let nextState = MPCWalletState.CREATED_SECOND_FACTOR
    if (!existingUser) {
      const newFactorKey = await initializeNewShare()
      setCreateNewMetadata(true)
      setFactorKey(newFactorKey)
    } else {
      await tKey.initialize({ neverInitializeNewKey: true })
      if (
        tKeyLocalStore?.verifier === loginResponse.userInfo.verifier &&
        tKeyLocalStore?.verifierId === loginResponse.userInfo.verifierId
      ) {
        // If the user is existing and the local storage has the factorKey corresponding the logged in user, we'll use that factorKey to get the deviceShare from metadata. Device Share is stored on the metadata encrypted by the factorKey.
        const factorKeyFromLocalStorage = new BN(tKeyLocalStore.factorKey, 'hex')
        await initializeTKeyForExistingUser(factorKeyFromLocalStorage)

        setFactorKey(factorKeyFromLocalStorage)
      } else {
        // If the user is existing but the local storage doesn't have the factorKey corresponding the logged in user, we'll ask the user to enter the backup factor key to get the deviceShare from metadata.
        nextState = MPCWalletState.RECOVERING_ACCOUNT_PASSWORD
      }
    }
    setWalletState(nextState)
  }, [fetchDeviceShare, initializeNewShare, initializeTKeyForExistingUser, loginResponse, oAuthShare, tKey])

  const recoverFactorWithPassword = async (password: string) => {
    try {
      const recoveredFactorKey = await recoverPasswordFactorKey(password)
      await initializeTKeyForExistingUser(recoveredFactorKey)

      setCreateNewMetadata(true)
      setFactorKey(recoveredFactorKey)
      setWalletState(MPCWalletState.CREATED_SECOND_FACTOR)
    } catch (error) {
      console.error(error)
      throw new Error('Invalid backup share')
    }
  }

  const triggerLogin = async () => {
    if (!tKey) {
      console.error('tKey not initialized yet')
      return
    }
    try {
      setLoginPending(true)
      // Triggering Login using Service Provider ==> opens the popup
      const loginResponse = await (tKey.serviceProvider as TorusServiceProvider).triggerLogin({
        typeOfLogin: 'google',
        verifier: WEB3AUTH_VERIFIER_ID,
        clientId: GOOGLE_CLIENT_ID,
      })

      setLoginResponse(loginResponse)
      setUser(loginResponse.userInfo)

      const OAuthShare = new BN(TorusUtils.getPostboxKey(loginResponse), 'hex')
      setOAuthShare(OAuthShare) // This private key is the OAuth Metadata Share

      setWalletState(MPCWalletState.AUTHENTICATED)
    } catch (error) {
      console.error(error)
      setLoginPending(false)
    }
  }

  // Login flow
  useEffect(() => {
    if (walletState === MPCWalletState.AUTHENTICATED) {
      deriveSecondShare()
    }
    if (walletState === MPCWalletState.CREATED_SECOND_FACTOR) {
      finalizeAccountCreation()
    }
    if (walletState === MPCWalletState.READY) {
      if (!onboard) {
        return
      }
      console.log('Connecting to onboard MPC module')
      connectWallet(onboard, {
        autoSelect: {
          label: ONBOARD_MPC_MODULE_LABEL,
          disableModals: true,
        },
      }).catch((reason) => console.error('Error connecting to MPC module:', reason))
    }
  }, [deriveSecondShare, finalizeAccountCreation, onboard, walletState])

  return {
    upsertPasswordBackup,
    recoverFactorWithPassword,
    loginPending,
    walletAddress,
    walletState,
    triggerLogin,
    resetAccount,
    user,
  }
}
