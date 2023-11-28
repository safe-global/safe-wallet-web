import { useContext } from 'react'

import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getRecoveryDelayModifiers } from '@/services/recovery/delay-modifier'
import { getRecoveryState } from '@/services/recovery/recovery-state'
import { chainBuilder } from '@/tests/builders/chains'
import { addressExBuilder, safeInfoBuilder } from '@/tests/builders/safe'
import { act, fireEvent, render, waitFor } from '@/tests/test-utils'
import { RecoveryContext, RecoveryProvider } from '..'

jest.mock('@/services/recovery/delay-modifier')
jest.mock('@/services/recovery/recovery-state')

const mockGetRecoveryDelayModifiers = getRecoveryDelayModifiers as jest.MockedFunction<typeof getRecoveryDelayModifiers>
const mockGetRecoveryState = getRecoveryState as jest.MockedFunction<typeof getRecoveryState>

jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/web3')
jest.mock('@/hooks/useChains')

const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>
const mockUseCurrentChain = useCurrentChain as jest.MockedFunction<typeof useCurrentChain>
const mockUseHasFeature = useHasFeature as jest.MockedFunction<typeof useHasFeature>

describe('RecoveryContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    mockGetRecoveryDelayModifiers.mockResolvedValue(delayModifiers as any)

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
      expect(mockGetRecoveryDelayModifiers).toHaveBeenCalledTimes(1)
      expect(mockGetRecoveryState).toHaveBeenCalledTimes(1)
    })

    act(() => {
      fireEvent.click(queryByText('Refetch')!)
    })

    await waitFor(() => {
      expect(mockGetRecoveryState).toHaveBeenCalledTimes(2)
    })

    expect(mockGetRecoveryDelayModifiers).toHaveBeenCalledTimes(1)
  })
})
