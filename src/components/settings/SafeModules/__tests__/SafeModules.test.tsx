import { render, waitFor } from '@/tests/test-utils'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import SafeModules from '..'
import type { AddressEx, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { ethers } from 'ethers'

const MOCK_MODULE_1 = ethers.utils.hexZeroPad('0x1', 20)
const MOCK_MODULE_2 = ethers.utils.hexZeroPad('0x2', 20)

describe('SafeModules', () => {
  it('should render placeholder label without any modules', async () => {
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {
        modules: [] as AddressEx[],
        chainId: '4',
      } as SafeInfo,
      safeAddress: '0x123',
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))

    const utils = render(<SafeModules />)
    await waitFor(() => expect(utils.getByText('No modules enabled')).toBeDefined())
  })

  it('should render placeholder label if safe is loading', async () => {
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {} as SafeInfo,
      safeAddress: '',
      safeError: undefined,
      safeLoading: true,
      safeLoaded: false,
    }))

    const utils = render(<SafeModules />)
    await waitFor(() => expect(utils.getByText('No modules enabled')).toBeDefined())
  })
  it('should render module addresses for defined modules', async () => {
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {
        modules: [
          {
            value: MOCK_MODULE_1,
          },
          {
            value: MOCK_MODULE_2,
          },
        ],
        chainId: '4',
      } as SafeInfo,
      safeAddress: '0x123',
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))

    const utils = render(<SafeModules />)
    await waitFor(() => expect(utils.getByText(MOCK_MODULE_1)).toBeDefined())
    await waitFor(() => expect(utils.getByText(MOCK_MODULE_2)).toBeDefined())
  })
})
