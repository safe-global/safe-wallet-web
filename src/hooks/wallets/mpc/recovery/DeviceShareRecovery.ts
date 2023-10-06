import {
  BrowserStorage,
  getWebBrowserFactor,
  storeWebBrowserFactor,
  TssShareType,
  type Web3AuthMPCCoreKit,
} from '@web3auth/mpc-core-kit'
import BN from 'bn.js'
import { getPubKeyPoint } from '@tkey-mpc/common-types'

export class DeviceShareRecovery {
  private mpcCoreKit: Web3AuthMPCCoreKit

  constructor(mpcCoreKit: Web3AuthMPCCoreKit) {
    this.mpcCoreKit = mpcCoreKit
  }

  async isEnabled() {
    if (!this.mpcCoreKit.tKey.metadata) {
      return false
    }
    return !!(await getWebBrowserFactor(this.mpcCoreKit))
  }

  async createAndStoreDeviceFactor() {
    const userAgent = navigator.userAgent

    const deviceFactorKey = new BN(
      await this.mpcCoreKit.createFactor({ shareType: TssShareType.DEVICE, additionalMetadata: { userAgent } }),
      'hex',
    )
    await storeWebBrowserFactor(deviceFactorKey, this.mpcCoreKit)
  }

  async removeDeviceFactor() {
    const deviceFactor = await getWebBrowserFactor(this.mpcCoreKit)
    if (!deviceFactor) {
      // No device factor exists. Nothing to do
      return
    }
    // Delete factor
    const key = new BN(deviceFactor, 'hex')
    const pubKey = getPubKeyPoint(key)
    await this.mpcCoreKit.deleteFactor(pubKey)

    // Remove from local storage
    const metadata = this.mpcCoreKit.tKey.getMetadata()
    const tkeyPubX = metadata.pubKey.x.toString(16, 64)
    const currentStorage = BrowserStorage.getInstance('mpc_corekit_store')
    currentStorage.remove(tkeyPubX)
  }
}
