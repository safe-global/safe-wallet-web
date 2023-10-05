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
    const key = new BN(deviceFactor, 'hex')
    const pubKey = getPubKeyPoint(key)
    const pubKeyX = pubKey.x.toString('hex', 64)
    await this.mpcCoreKit.deleteFactor(pubKey)
    const currentStorage = BrowserStorage.getInstance('mpc_corekit_store')
    currentStorage.set(pubKeyX, undefined)
  }
}
