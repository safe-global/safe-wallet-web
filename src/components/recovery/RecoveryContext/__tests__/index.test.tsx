import { faker } from '@faker-js/faker'
import { useContext } from 'react'

import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getDelayModifiers } from '@/services/recovery/delay-modifier'
import { getRecoveryState } from '@/services/recovery/recovery-state'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { chainBuilder } from '@/tests/builders/chains'
import { addressExBuilder, safeInfoBuilder } from '@/tests/builders/safe'
import { act, fireEvent, render, waitFor } from '@/tests/test-utils'
import { RecoveryContext, RecoveryProvider } from '..'
import { getTxDetails } from '@/services/tx/txDetails'

jest.mock('@/services/recovery/delay-modifier')
jest.mock('@/services/recovery/recovery-state')

const mockGetDelayModifiers = getDelayModifiers as jest.MockedFunction<typeof getDelayModifiers>
const mockGetRecoveryState = getRecoveryState as jest.MockedFunction<typeof getRecoveryState>

jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/web3')
jest.mock('@/hooks/useChains')
jest.mock('@/services/tx/txDetails')

const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>
const mockUseCurrentChain = useCurrentChain as jest.MockedFunction<typeof useCurrentChain>
const mockUseHasFeature = useHasFeature as jest.MockedFunction<typeof useHasFeature>
const mockGetTxDetails = getTxDetails as jest.MockedFunction<typeof getTxDetails>

describe('RecoveryContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Clear memoization cache
    getTxDetails.cache.clear?.()
  })

  it('should refetch manually calling it', async () => {
    mockUseHasFeature.mockReturnValue(true)
    const provider = {}
    mockUseWeb3ReadOnly.mockReturnValue(provider as any)
    const chainId = '5'
    const safe = safeInfoBuilder()
      .with({ chainId, modules: [addressExBuilder().build()] })
      .build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)
    const chain = chainBuilder().build()
    mockUseCurrentChain.mockReturnValue(chain)
    const delayModifiers = [{}]
    mockGetDelayModifiers.mockResolvedValue(delayModifiers as any)

    function Test() {
      const { refetch } = useContext(RecoveryContext)

      return <button onClick={refetch}>Refetch</button>
    }

    const { queryByText } = render(
      <RecoveryProvider>
        <Test />
      </RecoveryProvider>,
    )

    await waitFor(() => {
      expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)
      expect(mockGetRecoveryState).toHaveBeenCalledTimes(1)
    })

    act(() => {
      fireEvent.click(queryByText('Refetch')!)
    })

    await waitFor(() => {
      expect(mockGetRecoveryState).toHaveBeenCalledTimes(2)
    })

    expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)
  })

  it('should refetch when interacting with a Delay Modifier', async () => {
    mockUseHasFeature.mockReturnValue(true)
    const provider = {}
    mockUseWeb3ReadOnly.mockReturnValue(provider as any)
    const chainId = '5'
    const safe = safeInfoBuilder()
      .with({ chainId, modules: [addressExBuilder().build()] })
      .build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)
    const chain = chainBuilder().build()
    mockUseCurrentChain.mockReturnValue(chain)
    const delayModifierAddress = faker.finance.ethereumAddress()
    mockGetDelayModifiers.mockResolvedValue([{ address: delayModifierAddress } as any])
    mockGetTxDetails.mockResolvedValue({ txData: { to: { value: delayModifierAddress } } } as any)

    render(
      <RecoveryProvider>
        <></>
      </RecoveryProvider>,
    )

    await waitFor(() => {
      expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)
      expect(mockGetRecoveryState).toHaveBeenCalledTimes(1)
    })

    const txId = faker.string.alphanumeric()

    act(() => {
      txDispatch(TxEvent.PROCESSED, {
        txId,
        safeAddress: faker.finance.ethereumAddress(),
      })
    })

    await waitFor(() => {
      expect(mockGetTxDetails).toHaveBeenCalledTimes(1)
      expect(mockGetTxDetails).toHaveBeenNthCalledWith(1, txId, safe.chainId)

      expect(mockGetRecoveryState).toHaveBeenCalledTimes(2)
    })
  })
})
