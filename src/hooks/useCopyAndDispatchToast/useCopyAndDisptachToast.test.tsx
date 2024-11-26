import { renderHook, act } from '@/src/tests/test-utils'
import Clipboard from '@react-native-clipboard/clipboard'
import { useToastController } from '@tamagui/toast'
import { useCopyAndDispatchToast } from './index'

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
}))

jest.mock('@tamagui/toast', () => ({
  useToastController: jest.fn(),
}))

describe('useCopyAndDispatchToast', () => {
  const mockShow = jest.fn()

  beforeEach(() => {
    ;(useToastController as jest.Mock).mockReturnValue({
      show: mockShow,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('copies the provided value to the clipboard', () => {
    const { result } = renderHook(() => useCopyAndDispatchToast())
    const testValue = 'Test Clipboard Value'

    act(() => {
      result.current(testValue)
    })

    expect(Clipboard.setString).toHaveBeenCalledWith(testValue)
  })

  it('displays a toast message after copying', () => {
    const { result } = renderHook(() => useCopyAndDispatchToast())

    act(() => {
      result.current('Any Value')
    })

    expect(mockShow).toHaveBeenCalledWith('Address copied.', {
      native: false,
      duration: 2000,
    })
  })
})
