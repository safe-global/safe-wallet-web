import { ERC20__factory } from '@/types/contracts'
import { UNLIMITED_APPROVAL_AMOUNT } from '@/utils/tokens'
import type { BaseTransaction } from '@safe-global/safe-apps-sdk'
import type { DecodedDataResponse, TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { parseUnits, id } from 'ethers/lib/utils'

export const APPROVAL_SIGNATURE_HASH = id('approve(address,uint256)').slice(0, 10)

const MULTISEND_METHOD = 'multiSend'

const APPROVE_METHOD = 'approve'

const TRANSACTIONS_PARAM = 'transactions'

const ADDRESS_TYPE = 'address'
const UINT256_TYPE = 'uint256'

const ERC20_INTERFACE = ERC20__factory.createInterface()

export enum PSEUDO_APPROVAL_VALUES {
  UNLIMITED = 'Unlimited',
}

export type ApprovalInfo = {
  tokenInfo: (Omit<TokenInfo, 'logoUri' | 'name'> & { logoUri?: string }) | undefined
  tokenAddress: string
  spender: any
  amount: any
  amountFormatted: string
}

const parseApprovalAmount = (amount: string, decimals: number) => {
  if (amount === PSEUDO_APPROVAL_VALUES.UNLIMITED) {
    return UNLIMITED_APPROVAL_AMOUNT
  }

  return parseUnits(amount, decimals)
}

export const extractTxs: (txs: BaseTransaction[] | (DecodedDataResponse & { to: string })) => BaseTransaction[] = (
  txs,
) => {
  if (Array.isArray(txs)) {
    return txs
  }

  const isMultiSendCall = txs.method === MULTISEND_METHOD && txs.parameters.length === 1

  // Our multisend contract takes 1 param called transactions
  if (isMultiSendCall) {
    const txParam = txs.parameters[0]
    if (txParam.name === TRANSACTIONS_PARAM) {
      return txParam.valueDecoded
        ? txParam.valueDecoded.map((innerTx) => ({
            to: innerTx.to,
            data: innerTx.data,
            value: innerTx.value,
          }))
        : []
    }
  }

  const isApproveCall = txs.method === APPROVE_METHOD && txs.parameters.length === 2

  if (isApproveCall) {
    const spenderParam = txs.parameters[0]
    const amountParam = txs.parameters[1]

    // We only check the types here instead of the names may vary in ERC20 implementations
    if (
      spenderParam.type == ADDRESS_TYPE &&
      typeof spenderParam.value === 'string' &&
      amountParam.type === UINT256_TYPE &&
      typeof amountParam.value === 'string'
    ) {
      return [
        {
          to: txs.to,
          value: '0x',
          data: ERC20_INTERFACE.encodeFunctionData(APPROVE_METHOD, [spenderParam.value, amountParam.value]),
        },
      ]
    }
  }
  return []
}

export const updateApprovalTxs = (
  approvals: string[],
  approvalInfos: ApprovalInfo[] | undefined,
  txs: BaseTransaction[],
) => {
  let approvalID = 0
  const updatedTxs = txs.map((tx) => {
    if (tx.data.startsWith(APPROVAL_SIGNATURE_HASH)) {
      const newApproval = approvals[approvalID]
      const approvalInfo = approvalInfos?.[approvalID]
      if (!approvalInfo || !approvalInfo.tokenInfo) {
        // Without decimals and spender we cannot create a new tx
        return tx
      }
      approvalID++
      const decimals = approvalInfo.tokenInfo.decimals
      const newAmountWei = parseApprovalAmount(newApproval, decimals)
      return {
        to: approvalInfo.tokenAddress,
        value: '0',
        data: ERC20_INTERFACE.encodeFunctionData(APPROVE_METHOD, [approvalInfo.spender, newAmountWei]),
      }
    }
    return tx
  })

  return updatedTxs
}
