import { generateFactorKey } from '@web3auth/mpc-core-kit'
import EncryptionUtil from '../EncryptionUtil'

describe('EncryptionUtil', () => {
  it('should encrypt and decrypt content correctly', async () => {
    const factorKey = generateFactorKey()
    const util = new EncryptionUtil(factorKey.private)
    const testData = { test: 'someField', value: 420 }

    const encryptedMessage = await util.encrypt(testData)
    const decryptedMessage = await util.decrypt(encryptedMessage)

    expect(decryptedMessage).toEqual(testData)
  })

  it('should fail to decrypt data encrypted with different key', async () => {
    const factorKey1 = generateFactorKey()
    const factorKey2 = generateFactorKey()

    const util1 = new EncryptionUtil(factorKey1.private)
    const util2 = new EncryptionUtil(factorKey2.private)

    const testData = { test: 'someField', value: 420 }

    const encryptedMessage = await util1.encrypt(testData)

    expect(util2.decrypt(encryptedMessage)).rejects.toEqual(new Error('bad MAC after trying padded'))
  })
})
