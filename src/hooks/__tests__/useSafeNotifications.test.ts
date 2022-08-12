import { act } from '@testing-library/react'
import { renderHook } from '@/tests//test-utils'
import useSafeNotifications from '../../hooks/useSafeNotifications'
import useSafeInfo from '../../hooks/useSafeInfo'
import { showNotification } from '@/store/notificationsSlice'

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

describe('useSafeNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show a notification when the Safe version is out of date', async () => {
    // mock useSafeInfo to return a SafeInfo with an outdated version
    ;(useSafeInfo as jest.Mock).mockReturnValue({
      safe: {
        implementationVersionState: 'OUTDATED',
        version: '1.1.1',
      },
    })

    // render the hook
    const { result } = renderHook(() => useSafeNotifications())

    // await
    await act(async () => Promise.resolve())

    // check that the notification was shown
    expect(result.current).toBeUndefined()
    expect(showNotification).toHaveBeenCalled()
  })

  it('should not show a notification when the Safe version is up to date', async () => {
    ;(useSafeInfo as jest.Mock).mockReturnValue({
      safe: {
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
