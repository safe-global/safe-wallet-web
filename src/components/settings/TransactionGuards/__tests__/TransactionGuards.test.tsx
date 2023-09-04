import { render, waitFor } from '@/tests/test-utils'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { ethers } from 'ethers'
import TransactionGuards from '..'

const MOCK_GUARD = ethers.utils.hexZeroPad('0x1', 20)
const EMPTY_LABEL = 'No transaction guard set'

describe('TransactionGuards', () => {
  it('should render placeholder label without an tx guard', async () => {
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {
        guard: null,
        chainId: '4',
        version: '1.3.0',
      } as any as SafeInfo,
      safeAddress: '0x123',
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))

    const utils = render(<TransactionGuards />)
    await waitFor(() => expect(utils.getByText(EMPTY_LABEL)).toBeDefined())
  })

  it('should render null if safe is loading', async () => {
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {} as SafeInfo,
      safeAddress: '',
      safeError: undefined,
      safeLoading: true,
      safeLoaded: false,
    }))

    const utils = render(<TransactionGuards />)
    expect(utils.container.children.length).toEqual(0)
  })

  it('should render null if safe version < 1.3.0', async () => {
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {
        guard: null,
        chainId: '4',
        version: '1.2.0',
      } as any as SafeInfo,
      safeAddress: '0x123',
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))

    const utils = render(<TransactionGuards />)
    expect(utils.container.children.length).toEqual(0)
  })

  it('should render tx guard address if defined', async () => {
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {
        guard: {
          value: MOCK_GUARD,
        },
        chainId: '4',
        version: '1.3.0',
      } as SafeInfo,
      safeAddress: '0x123',
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))

    const utils = render(<TransactionGuards />)
    await waitFor(() => expect(utils.getByText(MOCK_GUARD)).toBeDefined())
  })
})
