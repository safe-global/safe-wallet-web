import { renderHook } from '@/tests/test-utils'
import { SafeCreationStatus, useSafeCreation } from '@/components/create-safe/useSafeCreation'

describe('useSafeCreation', () => {
  it('should return a PENDING state by default', () => {
    const { result } = renderHook(() => useSafeCreation())

    expect(result.current.status).toBe(SafeCreationStatus.PENDING)
  })
})
