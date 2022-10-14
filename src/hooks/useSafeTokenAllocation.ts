import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'

export const VESTING_URL = 'https://safe-claiming-app-data.gnosis-safe.io/allocations/'

export type VestingData = {
  tag: 'user' | 'ecosystem'
  account: string
  chainId: number
  contract: string
  vestingId: string
  durationWeeks: number
  startDate: number
  amount: string
  curve: 0 | 1
  proof: string[]
}

const fetchAllocation = async (chainId: string, safeAddress: string) => {
  try {
    const response = await fetch(`${VESTING_URL}${chainId}/${safeAddress}.json`)

    if (response.ok) {
      return response.json() as Promise<VestingData[]>
    }

    if (response.status === 404) {
      // No file exists => the safe is not part of any vesting
      return Promise.resolve([]) as Promise<VestingData[]>
    }
  } catch (err) {
    throw Error(`Error fetching vestings: ${err}`)
  }
}

const useSafeTokenAllocation = (): BigNumber | undefined => {
  const [allocation, setAllocation] = useState<BigNumber>()
  const { safe, safeAddress } = useSafeInfo()
  const chainId = safe.chainId

  const [allocationData] = useAsync<VestingData[] | undefined>(
    () => fetchAllocation(chainId, safeAddress),
    [chainId, safeAddress],
  )

  useEffect(() => {
    if (!allocationData) return

    const userAllocation = allocationData.find((data) => data.tag === 'user')
    const ecosystemAllocation = allocationData.find((data) => data.tag === 'ecosystem')
    const totalAllocation = BigNumber.from(userAllocation?.amount || '0').add(ecosystemAllocation?.amount || '0')

    setAllocation(totalAllocation)
  }, [allocationData])

  return allocation
}

export default useSafeTokenAllocation
