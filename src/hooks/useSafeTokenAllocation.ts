import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { isPast } from 'date-fns'
import { BigNumber } from 'ethers'
import { defaultAbiCoder, Interface } from 'ethers/lib/utils'
import { useMemo } from 'react'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import { getWeb3ReadOnly } from './wallets/web3'

export const VESTING_URL = 'https://safe-claiming-app-data.gnosis-safe.io/allocations/'

type VestingData = {
  tag: 'user' | 'ecosystem' | 'investor'
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

type Vesting = VestingData & {
  isExpired: boolean
  isRedeemed: boolean
  amountClaimed: string
}

// We currently do not have typechain as dependency so we fallback to human readable ABIs
const airdropInterface = new Interface([
  'function redeemDeadline() public returns (uint64)',
  'function vestings(bytes32) public returns ({address account, uint8 curveType,bool managed, uint16 durationWeeks, uint64 startDate, uint128 amount, uint128 amountClaimed, uint64 pausingDate,bool cancelled})',
])
const tokenInterface = new Interface(['function balanceOf(address _owner) public view returns (uint256 balance)'])

/**
 * Add on-chain information to allocation.
 * Fetches if the redeem deadline is expired and the claimed tokens from on-chain
 */
const completeAllocation = async (allocation: VestingData): Promise<Vesting> => {
  const web3ReadOnly = getWeb3ReadOnly()
  if (!web3ReadOnly) {
    throw new Error('Cannot fetch vesting without web3 provider')
  }
  const onChainVestingData = await web3ReadOnly.call({
    to: allocation.contract,
    data: airdropInterface.encodeFunctionData('vestings', [allocation.vestingId]),
  })

  const decodedVestingData = defaultAbiCoder.decode(
    // account, curveType, managed, durationWeeks, startDate, amount, amountClaimed, pausingDate, cancelled}
    ['address', 'uint8', 'bool', 'uint16', 'uint64', 'uint128', 'uint128', 'uint64', 'bool'],
    onChainVestingData,
  )
  const isRedeemed = decodedVestingData[0].toLowerCase() !== ZERO_ADDRESS.toLowerCase()
  if (isRedeemed) {
    return { ...allocation, isRedeemed, isExpired: false, amountClaimed: decodedVestingData[6] }
  }

  // Allocation is not yet redeemed => check the redeemDeadline
  const redeemDeadline = await web3ReadOnly.call({
    to: allocation.contract,
    data: airdropInterface.encodeFunctionData('redeemDeadline'),
  })

  const redeemDeadlineDate = new Date(BigNumber.from(redeemDeadline).mul(1000).toNumber())

  // Allocation is valid if redeem deadline is in future
  return { ...allocation, isRedeemed, isExpired: isPast(redeemDeadlineDate), amountClaimed: '0' }
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

const fetchTokenBalance = async (chainId: string, safeAddress: string): Promise<string> => {
  try {
    const web3ReadOnly = getWeb3ReadOnly()
    const safeTokenAddress = getSafeTokenAddress(chainId)
    if (!safeTokenAddress || !web3ReadOnly) return '0'

    return await web3ReadOnly.call({
      to: safeTokenAddress,
      data: tokenInterface.encodeFunctionData('balanceOf', [safeAddress]),
    })
  } catch (err) {
    throw Error(`Error fetching Safe Token balance:  ${err}`)
  }
}

/**
 * The Safe token allocation is equal to the voting power.
 * It is computed by adding all vested tokens - claimed tokens + token balance
 */
const useSafeTokenAllocation = (): [BigNumber | undefined, boolean] => {
  const { safe, safeAddress } = useSafeInfo()
  const chainId = safe.chainId

  const [allocationData, _, allocationLoading] = useAsync<Vesting[] | undefined>(async () => {
    if (!safeAddress) return
    return Promise.all(
      await fetchAllocation(chainId, safeAddress).then((allocations) =>
        allocations.map((allocation) => completeAllocation(allocation)),
      ),
    )
    // If the history tag changes we could have claimed / redeemed tokens
  }, [chainId, safeAddress, safe.txHistoryTag])

  const [balance, _error, balanceLoading] = useAsync<string>(() => {
    if (!safeAddress) return
    return fetchTokenBalance(chainId, safeAddress)
    // If the history tag changes we could have claimed / redeemed tokens
  }, [chainId, safeAddress, safe.txHistoryTag])

  const allocation = useMemo(() => {
    if (!allocationData || !balance) return

    const tokensInVesting = allocationData.reduce(
      (acc, data) => (data.isExpired ? acc : acc.add(data.amount).sub(data.amountClaimed)),
      BigNumber.from(0),
    )

    // add balance
    const totalAllocation = tokensInVesting.add(balance || '0')
    return totalAllocation
  }, [allocationData, balance])

  return [allocation, allocationLoading || balanceLoading]
}

export default useSafeTokenAllocation
