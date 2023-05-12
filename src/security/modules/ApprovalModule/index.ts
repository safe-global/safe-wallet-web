import { APPROVAL_SIGNATURE_HASH } from '@/components/tx/ApprovalEditor/utils/approvals'
import { ERC20__factory } from '@/types/contracts'
import { decodeMultiSendTxs } from '@/utils/transactions'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { id } from 'ethers/lib/utils'

export type ApprovalInfosResponse = {
  type: 'APPROVAL_INFOS'
  payload: Approval[]
}

export type Approval = {
  spender: any
  amount: any
  tokenAddress: string
}

const MULTISEND_SIGNATURE_HASH = id('multiSend(bytes)').slice(0, 10)
const ERC20_INTERFACE = ERC20__factory.createInterface()

export class ApprovalModule {
  private scanTransaction(txPartial: { to: string; data: string }): Approval[] {
    if (txPartial.data.startsWith(APPROVAL_SIGNATURE_HASH)) {
      const [spender, amount] = ERC20_INTERFACE.decodeFunctionData('approve', txPartial.data)
      return [
        {
          amount,
          spender,
          tokenAddress: txPartial.to,
        },
      ]
    }
    return []
  }

  scanTransactions(safeTx: SafeTransaction, callback: (response: ApprovalInfosResponse) => void): void {
    const safeTxData = safeTx.data.data
    const approvalInfos: Approval[] = []
    console.log(safeTxData, MULTISEND_SIGNATURE_HASH)
    if (safeTxData.startsWith(MULTISEND_SIGNATURE_HASH)) {
      const innerTxs = decodeMultiSendTxs(safeTxData)
      console.log('Decoded', innerTxs)
      approvalInfos.push(...innerTxs.flatMap((tx) => this.scanTransaction(tx)))
    } else {
      approvalInfos.push(...this.scanTransaction({ to: safeTx.data.to, data: safeTxData }))
    }

    console.log('Scanning complete:', approvalInfos)

    if (approvalInfos.length > 0) {
      callback({
        type: 'APPROVAL_INFOS',
        payload: approvalInfos,
      })
    }
  }
}
