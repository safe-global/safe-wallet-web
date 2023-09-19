import { generatePrivate } from 'eccrypto'
import ThresholdKey, { type Metadata } from '@tkey-mpc/core'

import BN from 'bn.js'
import { getPubKeyPoint, type ShareStore, type PolynomialID } from '@tkey-mpc/common-types'

export type TKeySetupParameters = {
  /** Initial metadata after initializing tKey */
  metadata: Metadata
  /** First share store */
  share1: ShareStore
  /** Second share store */
  share2: ShareStore
  /** TKey's private key */
  privateKey: string
}

export class MockThresholdKey extends ThresholdKey {
  private static INSTANCE: MockThresholdKey | undefined

  private initialized = false
  private setupParams: TKeySetupParameters

  private constructor(setupParams: TKeySetupParameters) {
    super({
      manualSync: true,
      enableLogging: true,
    })
    this.setupParams = setupParams
    this.init()
    MockThresholdKey.INSTANCE = this
  }

  isInitialized() {
    return this.initialized
  }

  static getInstance() {
    return MockThresholdKey.INSTANCE
  }

  static createInstance(setupParams: TKeySetupParameters) {
    return new MockThresholdKey(setupParams)
  }

  static resetInstance() {
    MockThresholdKey.INSTANCE = undefined
  }

  async init() {
    const factorKey = new BN(generatePrivate())
    const deviceTSSShare = new BN(generatePrivate())
    const deviceTSSIndex = 2
    const factorPub = getPubKeyPoint(factorKey)

    await this.initialize({
      useTSS: true,
      factorPub,
      deviceTSSShare,
      deviceTSSIndex,
      withShare: this.setupParams.share1,
    })
    await this._setKey(new BN(this.setupParams.privateKey, 'hex'))
    await this.inputShareStoreSafe(this.setupParams.share2)

    this.initialized = true
  }

  syncLocalMetadataTransitions(): Promise<void> {
    return Promise.resolve()
  }

  _syncShareMetadata(adjustScopedStore?: ((ss: unknown) => unknown) | undefined): Promise<void> {
    return Promise.resolve()
  }

  async catchupToLatestShare(params: {
    shareStore: ShareStore
    polyID?: PolynomialID
    includeLocalMetadataTransitions?: boolean
  }) {
    return Promise.resolve({
      latestShare: params.shareStore,
      shareMetadata: this.setupParams.metadata.clone(),
    })
  }
}
