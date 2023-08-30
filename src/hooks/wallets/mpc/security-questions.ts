import BN from 'bn.js'
import { keccak256 } from 'ethers/lib/utils'

export const answerToUserInputHashBN = (answerString: string): BN => {
  return new BN(keccak256(Buffer.from(answerString, 'utf8')))
}
