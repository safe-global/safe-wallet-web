import { act } from '@testing-library/react'
import { renderHook } from '@/tests//test-utils'
import useSafeNotifications from '../../hooks/useSafeNotifications'
import useSafeInfo from '../../hooks/useSafeInfo'
import { showNotification } from '@/store/notificationsSlice'
import * as contracts from '@/services/contracts/safeContracts'

// mock showNotification
jest.mock('@/store/notificationsSlice', () => {
  const original = jest.requireActual('@/store/notificationsSlice')
  return {
    ...original,
    showNotification: jest.fn(original.showNotification),
  }
})

// mock useSafeInfo
jest.mock('../../hooks/useSafeInfo')

// mock useIsSafeOwner
jest.mock('../../hooks/useIsSafeOwner', () => ({
  __esModule: true,
  default: jest.fn(() => true),
}))

// mock router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: { safe: 'eth:0x123' },
  })),
}))

describe('useSafeNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Safe upgrade', () => {
    it('should show a notification when the Safe version is out of date', async () => {
      // mock useSafeInfo to return a SafeInfo with an outdated version
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x123' },
          implementationVersionState: 'OUTDATED',
          version: '1.1.1',
        },
        safeAddress: '0x123',
      })

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // await
      await act(async () => Promise.resolve())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).toHaveBeenCalledWith({
        variant: 'warning',
        message: `Your Safe version 1.1.1 is out of date. Please update it.`,
        groupKey: 'safe-outdated-version',
        link: {
          href: {
            pathname: '/settings/setup',
            query: { safe: 'eth:0x123' },
          },
          title: 'Update Safe',
        },
      })
    })

    it('should show a notification for legacy Safes', async () => {
      // mock useSafeInfo to return a SafeInfo with an outdated version
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x123' },
          implementationVersionState: 'OUTDATED',
          version: '1.0.0',
        },
        safeAddress: '0x123',
      })

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // await
      await act(async () => Promise.resolve())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).toHaveBeenCalledWith({
        variant: 'warning',
        message: `Safe version 1.0.0 is not supported by this web app anymore. You can update your Safe via the old web app here.`,
        groupKey: 'safe-outdated-version',
        link: {
          href: 'https://gnosis-safe.io/app/eth:0x123/settings/details',
          title: 'Update Safe',
        },
      })
    })

    it('should not show a notification when the Safe version is up to date', async () => {
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x123' },
          implementationVersionState: 'UP_TO_DATE',
          version: '1.3.0',
        },
      })

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // await
      await act(async () => Promise.resolve())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).not.toHaveBeenCalled()
    })
  })

  describe('Invalid mastercopy', () => {
    it('should show a notification when the mastercopy is invalid', async () => {
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x123' },
          implementationVersionState: 'UP_TO_DATE',
          version: '1.3.0',
        },
      })
      jest.spyOn(contracts, 'isValidMasterCopy').mockImplementation((...args: any[]) => Promise.resolve(false))

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // await
      await act(async () => Promise.resolve())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).toHaveBeenCalledWith({
        variant: 'warning',
        message: `This Safe was created with an unsupported base contract.
           The web interface might not work correctly.
           We recommend using the command line interface instead.`,
        groupKey: 'invalid-mastercopy',
        link: {
          href: 'https://github.com/5afe/safe-cli',
          title: 'Get CLI',
        },
      })
    })
    it('should not show a notification when the mastercopy is valid', async () => {
      ;(useSafeInfo as jest.Mock).mockReturnValue({
        safe: {
          implementation: { value: '0x456' },
          implementationVersionState: 'UP_TO_DATE',
          version: '1.3.0',
        },
      })
      jest.spyOn(contracts, 'isValidMasterCopy').mockImplementation((...args: any[]) => Promise.resolve(true))

      // render the hook
      const { result } = renderHook(() => useSafeNotifications())

      // await
      await act(async () => Promise.resolve())

      // check that the notification was shown
      expect(result.current).toBeUndefined()
      expect(showNotification).not.toHaveBeenCalled()
    })
  })
})
