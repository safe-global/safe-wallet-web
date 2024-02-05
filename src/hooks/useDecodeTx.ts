import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type DecodedDataResponse, getDecodedData } from '@safe-global/safe-gateway-typescript-sdk'
import { getNativeTransferData } from '@/services/tx/tokenTransferParams'
import { isEmptyHexData } from '@/utils/hex'
import type { AsyncResult } from './useAsync'
import useAsync from './useAsync'
import useChainId from './useChainId'
import { ethers, Interface } from 'ethers'

const chainIdToName: Record<string, string> = {
  '1': 'ethereum',
  '100': 'xdai',
  '11155111': 'sepolia',
}

const GP2_SETTLEMENT_ADDRESS = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'

const humanReadableABI = 'function setPreSignature(bytes,bool)'
const PreSignInterface = new Interface([humanReadableABI])
const preSignSigHash = ethers.id('setPreSignature(bytes,bool)').slice(0, 10)

type CoWOrder = {
  sellToken: string
  buyToken: string
  receiver: string
  sellAmount: string
  buyAmount: string
  validTo: number
  feeAmount: string
  kind: 'buy' | 'sell'
  partiallyFillable: boolean
  sellTokenBalance: 'erc20' | 'internal' | 'external'
  buyTokenBalance: 'erc20' | 'internal'
  signingScheme: 'eip712' | 'ethsign' | 'presign' | 'eip1271'
  signature: string
  from: string
  quoteId: number | null
  appData: unknown
  appDataHash: string
  creationDate: string
  class: 'market' | 'limit' | 'liquidity'
  owner: string
  uid: string
  executedSellAmount: string
  executedSellAmountBeforeFees: string
  executedBuyAmount: string
  executedFeeAmount: string
  invalidated: boolean
  status: 'presignaturePending' | 'open' | 'fulfilled' | 'cancelled' | 'expired'
  fullFeeAmount: string
  isLiquidityOrder: boolean
  ethflowData: {
    refundTxHash: string
    userValidTo: number
  }
  onchainUser: string
  onchainOrderData: {
    sender: string
    placementError: 'QuoteNotFound' | 'ValidToTooFarInFuture' | 'PreValidationError'
  }
  executedSurplusFee: string
  fullAppData: string
}

const getCowOrderBookURI = (chainId: string) =>
  Object.keys(chainIdToName).includes(chainId) ? `https://api.cow.fi/${chainIdToName[chainId]}/api/v1/` : undefined

const COW_PRE_SIGN = 'setPreSignature'
// for now this lives here but ideally this would live on our gateway
export const useCowOrder = (txData?: { data?: string; value?: string }): AsyncResult<CoWOrder> => {
  const chainId = useChainId()
  const endpoint = getCowOrderBookURI(chainId)

  const [cowOrder, error, loading] = useAsync<CoWOrder>(() => {
    console.log('Trying to decode: ', txData?.data)
    console.log('Expected sighash:', preSignSigHash)

    if (endpoint && txData?.data?.startsWith(preSignSigHash)) {
      const txDescription = PreSignInterface.parseTransaction({ data: txData.data, value: txData.value })
      const orderUid = txDescription?.args[0]
      console.log('Found orderUid', orderUid)
      // This could be a cow order. Try to fetch the details from their API
      return fetch(`${endpoint}/orders/${orderUid}`)
        .then((resp) => {
          if (resp.ok) {
            return resp.json()
          } else {
            console.error('Error fetching CoW Order:', resp.statusText)
          }
        })
        .then((obj) => obj as CoWOrder)
    }
  }, [endpoint, txData?.data, txData?.value])

  console.log('CowOrder:', cowOrder)

  return [cowOrder, error, loading]
}

const useDecodeTx = (tx?: SafeTransaction): AsyncResult<DecodedDataResponse> => {
  const chainId = useChainId()
  const encodedData = tx?.data.data
  const isEmptyData = !!encodedData && isEmptyHexData(encodedData)
  const isRejection = isEmptyData && tx?.data.value === '0'
  const nativeTransfer = isEmptyData && !isRejection ? getNativeTransferData(tx?.data) : undefined

  const [data = nativeTransfer, error, loading] = useAsync<DecodedDataResponse>(() => {
    if (!encodedData || isEmptyData) return
    return getDecodedData(chainId, encodedData, tx.data.to)
  }, [chainId, encodedData, isEmptyData, tx?.data.to])

  return [data, error, loading]
}

export default useDecodeTx
