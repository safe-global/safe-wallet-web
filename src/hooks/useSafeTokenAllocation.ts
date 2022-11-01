import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'

export const VESTING_URL = 'https://safe-claiming-app-data.gnosis-safe.io/allocations/'

enum VestingTag {
  USER = 'user',
  ECOSYSTEM = 'ecosystem',
  INVESTOR = 'investor',
}

type VestingData = {
  tag: VestingTag
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

const fetchAllocation = async (chainId: string, safeAddress: string): Promise<VestingData[]> => {
  try {
    const response = await fetch(`${VESTING_URL}${chainId}/${safeAddress}.json`)

    // No file exists => the safe is not part of any vesting
    if (response.status === 404) {
      return Promise.resolve([]) as Promise<VestingData[]>
    }

    // Some other error
    if (!response.ok) {
      throw Error(`Error fetching vestings: ${response.statusText}`)
    }

    // Success
    return response.json() as Promise<VestingData[]>
  } catch (err) {
    throw Error(`Error fetching vestings: ${err}`)
  }
}

const getAllocationAmount = (allocation: VestingData[], tag: VestingTag): string => {
  return allocation.find((data) => data.tag === tag)?.amount || '0'
}

const useSafeTokenAllocation = (): BigNumber | undefined => {
  const [allocation, setAllocation] = useState<BigNumber>()
  const { safe, safeAddress } = useSafeInfo()
  const chainId = safe.chainId

  const [allocationData] = useAsync<VestingData[]>(() => {
    if (!safeAddress) return
    return fetchAllocation(chainId, safeAddress)
  }, [chainId, safeAddress])

  useEffect(() => {
    if (!allocationData) return

    const userAllocation = getAllocationAmount(allocationData, VestingTag.USER)
    const ecosystemAllocation = getAllocationAmount(allocationData, VestingTag.ECOSYSTEM)
    const investorAllocation = getAllocationAmount(allocationData, VestingTag.INVESTOR)

    const totalAllocation = BigNumber.from(userAllocation).add(ecosystemAllocation).add(investorAllocation)

    setAllocation(totalAllocation)
  }, [allocationData])

  return allocation
}

export default useSafeTokenAllocation
