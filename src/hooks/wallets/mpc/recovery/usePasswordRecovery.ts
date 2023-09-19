import useMPC from '@/hooks/wallets/mpc/useMPC'
import BN from 'bn.js'
import { generatePrivate } from 'eccrypto'
import {
  getPubKeyPoint,
  getPubKeyECC,
  toPrivKeyECC,
  encrypt,
  decrypt,
  type EncryptedMessage,
} from '@tkey-mpc/common-types'

import { keccak256 } from 'ethereum-cryptography/keccak'

const question = 'ENTER PASSWORD'

/**
 * Creates private key for a user input password
 * @param answerString password
 * @returns private key as BN
 */
export const answerToUserInputHashBN = (password: string): BN => {
  // TODO: Should we use a proper password hashing algorithm?
  // keccak256
  return new BN(keccak256(new Uint8Array(Buffer.from(password, 'utf8'))))
}

export const usePasswordRecovery = (localFactorKey: BN | null) => {
  const tKey = useMPC()

  /**
   * Create a new factor key for the device share encrypted with the password
   * Insert or update the share description for the password share.
   *
   * @param password
   */
  const upsertPasswordBackup = async (password: string) => {
    if (!tKey) {
      throw new Error('tkey does not exist, cannot add factor pub')
    }
    if (!localFactorKey) {
      throw new Error('localFactorKey does not exist, cannot add factor pub')
    }
    const tKeyShareDescription = tKey.getMetadata().getShareDescription()
    const existingPasswordShareDescription = tKeyShareDescription[question]

    const { copyExistingTSSShareForNewFactor, addFactorKeyMetadata } = await import('@/hooks/wallets/mpc/utils')

    try {
      // Generate new factor key
      const backupFactorKey = new BN(generatePrivate())
      const backupFactorPub = getPubKeyPoint(backupFactorKey)
      await copyExistingTSSShareForNewFactor(tKey, backupFactorPub, localFactorKey)
      const { tssShare: tssShare2, tssIndex: tssIndex2 } = await tKey.getTSSShare(localFactorKey)
      await addFactorKeyMetadata(tKey, backupFactorKey, tssShare2, tssIndex2, 'securityQuestions')

      // Store encrypted factor key with public key derived from password hash
      const passwordBN = answerToUserInputHashBN(password)
      const encryptedFactorKey = await encrypt(
        getPubKeyECC(passwordBN),
        Buffer.from(backupFactorKey.toString('hex'), 'hex'),
      )
      const params = {
        module: 'securityQuestions',
        associatedFactor: encryptedFactorKey,
        dateAdded: Date.now(),
      }

      if (!existingPasswordShareDescription) {
        await tKey.addShareDescription(question, JSON.stringify(params), true)
      } else {
        const existingPasswordShare = existingPasswordShareDescription[0]
        await tKey.updateShareDescription(question, existingPasswordShare, JSON.stringify(params), true)
      }

      await tKey.syncLocalMetadataTransitions()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   * Recover factor key from password
   * @param password
   * @returns
   */
  const recoverPasswordFactorKey = async (password: string) => {
    if (!tKey) {
      throw new Error('tkey does not exist, cannot add factor pub')
    }

    const tKeyShareDescriptions = tKey.getMetadata().getShareDescription()

    const passwordShareDescription = tKeyShareDescriptions[question]
    const passwordShare: EncryptedMessage | null | undefined = passwordShareDescription?.[0]
      ? JSON.parse(passwordShareDescription?.[0]).associatedFactor
      : null

    if (!passwordShare) {
      throw new Error('No password backup found')
    }

    const passwordBN = answerToUserInputHashBN(password)
    try {
      const factorKeyBuffer = await decrypt(toPrivKeyECC(passwordBN), passwordShare)
      const factorKey = new BN(Buffer.from(factorKeyBuffer).toString('hex'), 'hex')
      return factorKey
    } catch (error) {
      throw new Error('Unable to decrypt using the entered password.')
    }
  }

  return {
    upsertPasswordBackup,
    recoverPasswordFactorKey,
  }
}
