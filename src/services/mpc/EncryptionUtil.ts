import { getPubKeyPoint, encrypt, type EncryptedMessage, decrypt, toPrivKeyECC } from '@tkey-mpc/common-types'
import { Point } from '@web3auth/mpc-core-kit'
import type BN from 'bn.js'

/**
 * Util class to encrypt and decrypt data using i.e. the postbox key of the torus storage
 */
export default class EncryptionUtil {
  private privateKey: BN

  constructor(privateKey: BN) {
    this.privateKey = privateKey
  }

  public async encrypt<T>(data: T): Promise<string> {
    const oAuthKeyBN = this.privateKey
    const oAuthPubKey = getPubKeyPoint(oAuthKeyBN)
    const payload = JSON.stringify(data)
    const encryptedMessage = await encrypt(
      Point.fromTkeyPoint(oAuthPubKey).toBufferSEC1(false),
      Buffer.from(payload, 'utf-8'),
    )

    return JSON.stringify(encryptedMessage)
  }

  public async decrypt<T>(data: string): Promise<T> {
    const encryptedData = JSON.parse(data) as EncryptedMessage
    const decryptedDataBuffer = await decrypt(toPrivKeyECC(this.privateKey), encryptedData)
    return JSON.parse(decryptedDataBuffer.toString('utf-8')) as T
  }
}
