import { toPrivKeyEC } from '@tkey-mpc/common-types'
import {
  BrowserStorage,
  FactorKeyTypeShareDescription,
  generateFactorKey,
  TssShareType,
  type Web3AuthMPCCoreKit,
} from '@web3auth/mpc-core-kit'
import { BN } from 'bn.js'
import { ecsign, keccak256 } from 'ethereumjs-util'
import { hexZeroPad } from 'ethers/lib/utils'
import { SOCIAL_WALLET_OPTIONS } from '../config'

type SmsOtpStoreData = {
  number: string
  moduleName: string
}

interface IRegisterRequestBody {
  pubKey: {
    x: string
    y: string
  }
  sig: {
    r: string
    s: string
    v: string
  }
  identifier: string
}

interface IStartRequestBody {
  // `${pubKey.x.toString(16, 64)}{pubkey.y.toString(16, 64)}`
  address: string

  // web3auth client id.
  client_id: string

  // This is the value you get from the first /start response body.
  // Save this in session storage.
  // Send this value in next /start requests (page reload, resend code, verify).
  // It helps the backend to identify a unique verification session.
  tracking_id?: string
}

interface IVerifyRequestBody {
  // `${pubKey.x.toString(16, 64)}{pubkey.y.toString(16, 64)}`
  address: string

  // web3auth client id.
  client_id: string

  // Get it from the session storage, saved previously from the /start request.
  tracking_id: string

  // unique identifier, entered by the user
  code: string

  // custom metadata you want to set with the user.
  // this is only for the first time, when user is setting up the MFA for the first time.
  // Send the factorKey in this, which could be in raw format or encrypted using the postbox key.
  // This can always be updated in the future as well.
  data?: string
}

export const SMS_OTP_MODULE_NAME = 'SmsRecovery'

export class SmsOtpRecovery {
  private mpcCoreKit: Web3AuthMPCCoreKit
  private static BASE_URL = 'https://api-external-safeauth.web3auth.com'

  constructor(mpcCoreKit: Web3AuthMPCCoreKit) {
    this.mpcCoreKit = mpcCoreKit
  }

  isEnabled(): boolean {
    try {
      const shareDescriptions = Object.values(this.mpcCoreKit.getKeyDetails().shareDescriptions).map((i) =>
        (i || [])[0] ? JSON.parse(i[0]) : {},
      )

      return shareDescriptions.some(
        (shareDescription) =>
          shareDescription.module === FactorKeyTypeShareDescription.Other &&
          shareDescription.moduleName === SMS_OTP_MODULE_NAME,
      )
    } catch (err) {
      return false
    }
  }

  getSmsRecoveryNumber(): string | undefined {
    try {
      const shareDescriptions = Object.values(this.mpcCoreKit.getKeyDetails().shareDescriptions).map((i) =>
        (i || [])[0] ? JSON.parse(i[0]) : {},
      )

      return shareDescriptions.find(
        (shareDescription) =>
          shareDescription.module === FactorKeyTypeShareDescription.Other &&
          shareDescription.moduleName === SMS_OTP_MODULE_NAME,
      )?.number
    } catch (err) {
      return
    }
  }

  getRecoveryPubKey(): string {
    if (this.mpcCoreKit.tKey.privKey) {
      const privKey = toPrivKeyEC(this.mpcCoreKit.tKey.privKey)
      const pubKey = privKey.getPublic()
      return `${pubKey.getX().toString(16, 64)}${pubKey.getY().toString(16, 64)}`
    }

    const pubKey = this.mpcCoreKit.tKey.metadata.pubKey
    return `${pubKey.x.toString(16, 64)}${pubKey.y.toString(16, 64)}`
  }

  async registerDevice(mobileNumber: string): Promise<boolean> {
    if (this.isEnabled()) {
      throw new Error('SMS Recovery is already setup!')
    }
    const privKey = toPrivKeyEC(this.mpcCoreKit.tKey.privKey)
    const pubKey = privKey.getPublic()
    const sig = ecsign(
      keccak256(Buffer.from(mobileNumber, 'utf8')),
      Buffer.from(this.mpcCoreKit.tKey.privKey.toString(16, 64), 'hex'),
    )

    const data = {
      pubKey: {
        x: pubKey.getX().toString(16, 64),
        y: pubKey.getY().toString(16, 64),
      },
      sig: {
        r: hexZeroPad(`0x${sig.r.toString('hex')}`, 32).slice(2),
        s: hexZeroPad(`0x${sig.s.toString('hex')}`, 32).slice(2),
        v: new BN(sig.v).toString(16, 2),
      },
      identifier: mobileNumber,
    }

    const response = await fetch(`${SmsOtpRecovery.BASE_URL}/api/v1/sms/register`, {
      method: 'POST',
      headers: {
        'content-type': 'application/JSON',
      },
      body: JSON.stringify(data),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json()
      } else {
        throw new Error('Invalid register request')
      }
    })

    return response.success === true
  }

  async startVerification() {
    const currentStorage = BrowserStorage.getInstance('mpc_corekit_store')
    const tracking_id = currentStorage.get('sms_tracking_id')
    const pubKey = this.getRecoveryPubKey()
    if (!pubKey) {
      throw new Error('Could not find public key for recovery')
    }
    const data: IStartRequestBody = {
      address: pubKey,
      client_id: SOCIAL_WALLET_OPTIONS.web3AuthClientId,
    }

    if (typeof tracking_id === 'string') {
      data.tracking_id = tracking_id
    }

    const response = await fetch(`${SmsOtpRecovery.BASE_URL}/api/v1/sms/start`, {
      method: 'POST',
      headers: {
        'content-type': 'application/JSON',
      },
      body: JSON.stringify(data),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json()
      } else {
        if (resp.status === 429) {
          throw new Error('Rate limit exceeded. Try again later')
        }
        throw new Error('Registration process could not be started.')
      }
    })

    if ('tracking_id' in response) {
      currentStorage.set('sms_tracking_id', response.tracking_id)
    }
  }

  async verifyNumber(number: string, code: string, isFirstTime: boolean): Promise<boolean> {
    const currentStorage = BrowserStorage.getInstance('mpc_corekit_store')
    const tracking_id = currentStorage.get('sms_tracking_id')
    if (typeof tracking_id !== 'string') {
      return false
    }
    const pubKey = this.getRecoveryPubKey()

    const data: IVerifyRequestBody = {
      address: pubKey,
      client_id: SOCIAL_WALLET_OPTIONS.web3AuthClientId,
      code,
      tracking_id,
    }

    if (isFirstTime) {
      // create a new factor key to setup data in the database.
      const newFactorKey = generateFactorKey()
      data.data = JSON.stringify({ factorKey: newFactorKey.private.toString(16, 64) })
    }

    const response = await fetch(`${SmsOtpRecovery.BASE_URL}/api/v1/sms/verify`, {
      method: 'POST',
      headers: {
        'content-type': 'application/JSON',
      },
      body: JSON.stringify(data),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json()
      } else {
        throw new Error('Invalid verify request')
      }
    })

    // if successfull, add this factorKey and share info in tkey instance.
    const storedFactorKey = JSON.parse(response.data)?.factorKey
    if (storedFactorKey) {
      const newFactorKey = new BN(storedFactorKey, 'hex')
      if (isFirstTime) {
        const storeData: SmsOtpStoreData = {
          number,
          moduleName: SMS_OTP_MODULE_NAME,
        }
        await this.mpcCoreKit.createFactor({
          shareType: TssShareType.DEVICE,
          factorKey: newFactorKey,
          shareDescription: FactorKeyTypeShareDescription.Other,
          additionalMetadata: storeData,
        })
      } else {
        await this.mpcCoreKit.inputFactorKey(newFactorKey)
      }

      currentStorage.remove('sms_tracking_id')
      return true
    }
    currentStorage.remove('sms_tracking_id')
    return false
  }
}
