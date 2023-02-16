import type { IStream } from '@/components/safe-apps/types'
import { networkDetails } from '@/utils/networkDetails'
import * as React from 'react'
import type { StreamAndHistoryQuery } from 'services/generated/graphql'
import { useStreamAndHistoryQuery } from 'services/generated/graphql'
import useChainId from '../useChainId'
import { useCurrentChain } from '../useChains'

export const defaultSubgraphEndpoint = 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-avax-mainnet'

const useStreamsAndHistory = (address: string) => {
  const chainId = useChainId()
  const chain = useCurrentChain()
  const endpoint = chainId ? networkDetails[Number(chainId)]?.subgraphEndpoint : defaultSubgraphEndpoint
  const { data, isLoading, error } = useStreamAndHistoryQuery(
    {
      endpoint,
    },
    {
      id: address.toLowerCase(),
      network: chain?.chainName || '',
    },
    {
      refetchInterval: 30000,
    },
  )

  const formattedData = useFormatStreamAndHistory({ data, address })

  return React.useMemo(() => ({ data: formattedData, isLoading, error }), [formattedData, isLoading, error])
}

function useFormatStreamAndHistory({ data, address }: { data?: StreamAndHistoryQuery; address: string }): IStream[] {
  return React.useMemo(() => {
    const streams = data?.user?.streams ?? []

    const formattedStreams = streams.map((s) => formatStream({ stream: s, address }))

    return formattedStreams
  }, [data, address])
}

const formatStream = ({ stream, address }: { stream: any; address: string }): IStream => {
  const streamType: 'outgoingStream' | 'incomingStream' =
    stream.payer.id?.toLowerCase() === address.toLowerCase() ? 'outgoingStream' : 'incomingStream'

  return {
    llamaContractAddress: stream.contract.address,
    amountPerSec: stream.amountPerSec,
    createdTimestamp: stream.createdTimestamp,
    payerAddress: stream.payer.id,
    payeeAddress: stream.payee.id,
    streamId: stream.streamId,
    streamType,
    token: stream.token,
    tokenName: stream.token.name,
    tokenSymbol: stream.token.symbol,
    historicalEvents: stream.historicalEvents,
    paused: stream.paused,
    pausedAmount: stream.pausedAmount,
    lastPaused: stream.lastPaused,
    reason: stream.reason || null,
  }
}

export default useStreamsAndHistory
