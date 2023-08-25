import ExternalStore from '@/services/ExternalStore'
import BN from 'bn.js'
import { generatePrivate } from 'eccrypto'
import { getPubKeyPoint } from '@tkey-mpc/common-types'
import TorusUtils from '@toruslabs/torus.js'
import type ThresholdKey from '@tkey-mpc/core'
import { type TorusStorageLayer } from '@tkey-mpc/storage-layer-torus'

import { useEffect, useState } from 'react'
import type { TorusServiceProvider } from '@tkey-mpc/service-provider-torus'
import type { TorusLoginResponse, TorusVerifierResponse, LoginWindowResponse } from '@toruslabs/customauth'
import useMPC from '@/hooks/wallets/mpc/useMPC'
import { utils } from '@toruslabs/tss-client'
import type { ConnectedWallet } from '../useOnboard'
import { ethers } from 'ethers'
import { GOOGLE_CLIENT_ID, WEB3AUTH_VERIFIER_ID } from '@/config/constants'
import { useCurrentChain } from '@/hooks/useChains'
import { getRpcServiceUrl } from '../web3'

const { getTSSPubKey } = utils

export type MPCWallet = ConnectedWallet

export const {
  getStore: getMPCProvider,
  setStore: setMPCProvider,
  useStore: useMPCProvider,
} = new ExternalStore<MPCWallet>()

const isMetadataPresent = async (tKey: ThresholdKey, privateKeyBN: BN) => {
  const metadata = (await (tKey.storageLayer as TorusStorageLayer).getMetadata({ privKey: privateKeyBN })) as any
  if (metadata && Object.keys(metadata).length > 0 && metadata.message !== 'KEY_NOT_FOUND') {
    return true
  } else {
    return false
  }
}

export const useMPCWallet = () => {
  const [loginResponse, setLoginResponse] = useState<TorusLoginResponse>()
  const [loginPending, setLoginPending] = useState(false)
  const [oAuthShare, setOAuthShare] = useState<BN>()
  const [metadataKey, setMetadataKey] = useState<string>()
  const [localFactorKey, setLocalFactorKey] = useState<BN | null>(null)
  const [user, setUser] = useState<TorusVerifierResponse & LoginWindowResponse>()
  const [signingParams, setSigningParams] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState<string>()
  const [manualBackup, setManualBackup] = useState<string>()

  useEffect(() => {
    if (!localFactorKey || !loginResponse) return
    localStorage.setItem(
      `tKeyLocalStore\u001c${loginResponse.userInfo.verifier}\u001c${loginResponse.userInfo.verifierId}`,
      JSON.stringify({
        factorKey: localFactorKey.toString('hex'),
        verifier: loginResponse.userInfo.verifier,
        verifierId: loginResponse.userInfo.verifierId,
      }),
    )
  }, [localFactorKey, loginResponse])

  const tKey = useMPC()

  const chain = useCurrentChain()

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
      console.log(chainConfig)
      const web3Local = await setupWeb3(chainConfig, loginResponse, signingParams)

      const accountsResponse = await web3Local?.send('eth_accounts', [])
      if (Array.isArray(accountsResponse) && accountsResponse.length > 0) {
        setWalletAddress(accountsResponse[0])
      }

      if (web3Local) {
        setMPCProvider({
          provider: web3Local,
          address: walletAddress ? ethers.utils.getAddress(walletAddress) : '',
          label: 'Web3Auth',
          ens: user?.email,
          chainId: chain.chainId,
        })
      }
    }
    if (signingParams) {
      localSetup()
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
      console.log('Reset Account Successful.')
      setUser(undefined)
    } catch (e) {
      console.error(e)
    }
  }

  const copyTSSShareIntoManualBackupFactorkey = async () => {
    try {
      if (!tKey) {
        throw new Error('tkey does not exist, cannot add factor pub')
      }
      if (!localFactorKey) {
        throw new Error('localFactorKey does not exist, cannot add factor pub')
      }

      const { copyExistingTSSShareForNewFactor, addFactorKeyMetadata } = await import('@/hooks/wallets/mpc/utils')

      const backupFactorKey = new BN(generatePrivate())
      const backupFactorPub = getPubKeyPoint(backupFactorKey)

      await copyExistingTSSShareForNewFactor(tKey, backupFactorPub, localFactorKey)

      const { tssShare: tssShare2, tssIndex: tssIndex2 } = await tKey.getTSSShare(localFactorKey)
      await addFactorKeyMetadata(tKey, backupFactorKey, tssShare2, tssIndex2, 'manual share')
      const serializedShare = await (tKey.modules.shareSerialization as any).serialize(backupFactorKey, 'mnemonic')
      await tKey.syncLocalMetadataTransitions()
      setManualBackup(serializedShare)
    } catch (err) {
      console.error(`Failed to copy share to new manual factor: ${err}`)
    }
  }

  const triggerLogin = async () => {
    if (!tKey) {
      console.error('tKey not initialized yet')
      return
    }
    try {
      const { addFactorKeyMetadata, getEcCrypto } = await import('@/hooks/wallets/mpc/utils')

      setLoginPending(true)
      // Triggering Login using Service Provider ==> opens the popup
      const loginResponse = await (tKey.serviceProvider as TorusServiceProvider).triggerLogin({
        typeOfLogin: 'google',
        verifier: WEB3AUTH_VERIFIER_ID,
        clientId: GOOGLE_CLIENT_ID,
      })
      console.log('Login successful', loginResponse)

      setLoginResponse(loginResponse)
      setUser(loginResponse.userInfo)

      const OAuthShare = new BN(TorusUtils.getPostboxKey(loginResponse), 'hex')
      setOAuthShare(OAuthShare) // This private key is the OAuth Metadata Share

      // Filter out the null values from the signatures
      const signatures = loginResponse.sessionData.sessionTokenData
        .filter((i) => Boolean(i))
        .map((session) => JSON.stringify({ data: session.token, sig: session.signature }))

      // Get the Device Share
      const tKeyLocalStoreString = localStorage.getItem(
        `tKeyLocalStore\u001c${loginResponse.userInfo.verifier}\u001c${loginResponse.userInfo.verifierId}`,
      )
      const tKeyLocalStore = JSON.parse(tKeyLocalStoreString || '{}')

      // Define the factorKey variable for later usage. Please note that this factorKey represents the factorKey 2, ie. device share or recovery share in the 2/2 flow
      let factorKey: BN | null = null

      // Check if the user is new or existing
      const existingUser = await isMetadataPresent(tKey, OAuthShare)

      if (!existingUser) {
        console.log('User not yet existing!')
        // If the user is new, we'll generate a new factorKey & deviceShare and store it in the local storage. The factorKey can be used to get the deviceShare from metadata. Device Share is stored on the metadata encrypted by the factorKey.
        factorKey = new BN(generatePrivate())
        const deviceTSSShare = new BN(generatePrivate())
        const deviceTSSIndex = 2
        const factorPub = getPubKeyPoint(factorKey)
        await tKey.initialize({ useTSS: true, factorPub, deviceTSSShare, deviceTSSIndex })
      } else {
        console.log('User exists!')
        if (
          tKeyLocalStore.verifier === loginResponse.userInfo.verifier &&
          tKeyLocalStore.verifierId === loginResponse.userInfo.verifierId
        ) {
          // If the user is existing and the local storage has the factorKey corresponding the logged in user, we'll use that factorKey to get the deviceShare from metadata. Device Share is stored on the metadata encrypted by the factorKey.
          factorKey = new BN(tKeyLocalStore.factorKey, 'hex')
        } else {
          // If the user is existing but the local storage doesn't have the factorKey corresponding the logged in user, we'll ask the user to enter the backup factor key to get the deviceShare from metadata.
          try {
            const mnemonic = prompt('Enter your backup share')

            factorKey = await (tKey.modules.shareSerialization as any).deserialize(mnemonic, 'mnemonic')
          } catch (error) {
            console.error(error)
            throw new Error('Invalid backup share')
          }
        }
        // if the factorKey is null, it means the user entered an invalid backup share
        if (factorKey === null) throw new Error('Backup share not found')

        // Get the corresponding TSS share from metadata using the factorKey
        const factorKeyMetadata = await tKey.storageLayer.getMetadata<{
          message: string
        }>({
          privKey: factorKey,
        })

        // If the metadata doesn't have the TSS Share, it means the user has entered an invalid backup share
        if (factorKeyMetadata.message === 'KEY_NOT_FOUND') {
          throw new Error('no metadata for your factor key, reset your account')
        }
        const metadataShare = JSON.parse(factorKeyMetadata.message)
        if (!metadataShare.deviceShare || !metadataShare.tssShare) throw new Error('Invalid data from metadata')

        const metadataDeviceShare = metadataShare.deviceShare

        // Initialize the tKey with the TSS Share from metadata
        await tKey.initialize({ neverInitializeNewKey: true })
        await tKey.inputShareStoreSafe(metadataDeviceShare, true)
      }

      // Checks the requiredShares to reconstruct the tKey, starts from 2 by default and each of the above share reduce it by one.
      const { requiredShares } = tKey.getKeyDetails()
      if (requiredShares > 0) {
        throw `Threshold not met. Required Share: ${requiredShares}. You should reset your account.`
      }

      // Reconstruct the Metadata Key
      const metadataKey = await tKey.reconstructKey()
      setMetadataKey(metadataKey?.privKey.toString('hex'))

      const tssNonce: number = tKey.metadata.tssNonces![tKey.tssTag]
      // tssShare1 = TSS Share from the social login/ service provider
      const tssShare1PubKeyDetails = await tKey.serviceProvider.getTSSPubKey(tKey.tssTag, tssNonce)
      const tssShare1PubKey = {
        x: tssShare1PubKeyDetails.pubKey.x.toString('hex'),
        y: tssShare1PubKeyDetails.pubKey.y.toString('hex'),
      }

      // tssShare2 = TSS Share from the local storage of the device
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
      if (
        !existingUser ||
        !(
          tKeyLocalStore.verifier === loginResponse.userInfo.verifier &&
          tKeyLocalStore.verifierId === loginResponse.userInfo.verifierId
        )
      ) {
        console.log('Adding factor key metadata')
        await addFactorKeyMetadata(tKey, factorKey, tssShare2, tssShare2Index, 'local storage share')
      }
      await tKey.syncLocalMetadataTransitions()

      setLocalFactorKey(factorKey)

      const nodeDetails = await tKey.serviceProvider.getTSSNodeDetails()

      setSigningParams({
        tssNonce,
        tssShare2,
        tssShare2Index,
        compressedTSSPubKey,
        signatures,
        nodeDetails,
      })

      console.log(
        'Successfully logged in & initialised MPC TKey SDK',
        'TSS Public Key: ',
        tKey.getTSSPub(),
        'Metadata Key',
        metadataKey.privKey.toString('hex'),
        'With Factors/Shares:',
        tKey.getMetadata().getShareDescription(),
      )

      setLoginPending(false)
    } catch (error) {
      setLoginPending(false)
      console.error(error)
    }
  }

  return {
    copyTSSShareIntoManualBackupFactorkey,
    manualBackup,
    setManualBackup,
    loginPending,
    walletAddress,
    triggerLogin,
    resetAccount,
    user,
  }
}
