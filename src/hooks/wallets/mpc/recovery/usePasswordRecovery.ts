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

export const answerToUserInputHashBN = (answerString: string): BN => {
  return new BN(keccak256(Buffer.from(answerString, 'utf8')))
}

export const usePasswordRecovery = (localFactorKey: BN | null) => {
  const tKey = useMPC()

  /**
   * Insert or update current backup password
   * @param password new password to add as factor
   */
  const upsertPasswordBackup = async (password: string) => {
    if (!tKey) {
      throw new Error('tkey does not exist, cannot add factor pub')
    }
    if (!localFactorKey) {
      throw new Error('localFactorKey does not exist, cannot add factor pub')
    }
    const tKeyShareDescription = tKey.getMetadata().getShareDescription()
    const existingPasswordShareDescription = Object.entries(tKeyShareDescription).find(
      ([key, value]) => key === question && value[0],
    )

    const { copyExistingTSSShareForNewFactor, addFactorKeyMetadata } = await import('@/hooks/wallets/mpc/utils')

    try {
      const backupFactorKey = new BN(generatePrivate())
      const backupFactorPub = getPubKeyPoint(backupFactorKey)
      await copyExistingTSSShareForNewFactor(tKey, backupFactorPub, localFactorKey)
      const { tssShare: tssShare2, tssIndex: tssIndex2 } = await tKey.getTSSShare(localFactorKey)
      await addFactorKeyMetadata(tKey, backupFactorKey, tssShare2, tssIndex2, 'securityQuestions')

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
        const existingPasswordShare = existingPasswordShareDescription[1][0]
        await tKey.updateShareDescription(question, existingPasswordShare, JSON.stringify(params), true)
      }

      await tKey.syncLocalMetadataTransitions()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   * Recover device share from password
   * @param password
   * @returns
   */
  const recoverPasswordFactorKey = async (password: string) => {
    if (!tKey) {
      throw new Error('tkey does not exist, cannot add factor pub')
    }

    debugger
    const tKeyShareDescriptions = tKey.getMetadata().getShareDescription()

    const passwordShareDescription = Object.entries(tKeyShareDescriptions).find(([key, value]) => key === question)
    const passwordShare: EncryptedMessage | null | undefined = passwordShareDescription?.[1][0]
      ? JSON.parse(passwordShareDescription?.[1][0]).associatedFactor
      : null

    if (!passwordShare) {
      throw new Error('No password backup found')
    }

    const passwordBN = answerToUserInputHashBN(password)
    const factorKeyHex = await decrypt(toPrivKeyECC(passwordBN), passwordShare)
    const factorKey = new BN(Buffer.from(factorKeyHex).toString('hex'), 'hex')

    return factorKey
  }

  return {
    upsertPasswordBackup,
    recoverPasswordFactorKey,
  }
}
