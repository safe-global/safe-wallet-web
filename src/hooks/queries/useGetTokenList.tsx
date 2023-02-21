import type { ITokenList } from '@/components/safe-apps/types'
import { networkDetails } from '@/utils/networkDetails'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import useChainId from '../useChainId'

const fetchTokenList = async (id?: string) => {
  if (!id) return null

  const { data } = await axios.get(`https://defillama-datasets.s3.eu-central-1.amazonaws.com/tokenlist/${id}.json`)

  return data ?? {}
}

export function useGetTokenList() {
  const chainId = useChainId()
  const tokenListId = networkDetails[Number(chainId)].tokenListId || ''

  return useQuery<ITokenList>(['tokenlist', tokenListId], () => fetchTokenList(tokenListId), {
    refetchInterval: 30000,
  })
}
