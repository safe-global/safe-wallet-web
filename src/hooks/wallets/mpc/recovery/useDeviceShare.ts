import {
  BrowserStorage,
  getWebBrowserFactor,
  storeWebBrowserFactor,
  TssShareType,
  type Web3AuthMPCCoreKit,
} from '@web3auth/mpc-core-kit'
import BN from 'bn.js'
import { getPubKeyPoint } from '@tkey-mpc/common-types'

export const useDeviceShare = (mpcCoreKit: Web3AuthMPCCoreKit | undefined) => {
  const isEnabled = async () => {
    if (!mpcCoreKit || !mpcCoreKit.tKey.metadata) {
      return false
    }
    return !!(await getWebBrowserFactor(mpcCoreKit))
  }

  const createAndStoreDeviceFactor = async () => {
    if (!mpcCoreKit) {
      return
    }
    const userAgent = navigator.userAgent

    const deviceFactorKey = new BN(
      await mpcCoreKit.createFactor({ shareType: TssShareType.DEVICE, additionalMetadata: { userAgent } }),
      'hex',
    )
    await storeWebBrowserFactor(deviceFactorKey, mpcCoreKit)
  }

  const removeDeviceFactor = async () => {
    if (!mpcCoreKit) {
      return
    }
    const deviceFactor = await getWebBrowserFactor(mpcCoreKit)
    const key = new BN(deviceFactor, 'hex')
    const pubKey = getPubKeyPoint(key)
    const pubKeyX = pubKey.x.toString('hex', 64)
    await mpcCoreKit.deleteFactor(pubKey)
    const currentStorage = BrowserStorage.getInstance('mpc_corekit_store')
    debugger
    currentStorage.set(pubKeyX, undefined)
  }

  return {
    isEnabled,
    createAndStoreDeviceFactor,
    removeDeviceFactor,
  }
}
