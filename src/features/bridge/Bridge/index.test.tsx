import type { NextRouter } from 'next/router'

import { render } from '@/tests/test-utils'
import { _Bridge } from '@/features/bridge/Bridge'
import type * as useChains from '@/hooks/useChains'

const mockRouter = {
  replace: jest.fn(),
} as jest.MockedObjectDeep<NextRouter>

const mockUseChains = {
  useHasFeature: jest.fn(),
} as jest.MockedObjectDeep<typeof useChains>

describe('Bridge', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter)
    jest.spyOn(require('@/hooks/useChains'), 'default').mockReturnValue(mockUseChains)
  })

  it('should replace with home if feature is disabled', () => {
    render(<_Bridge isFeatureEnabled={() => false} />)

    expect(mockRouter.replace).toHaveBeenCalledWith('/home')
  })

  it('should render BridgeWidget if feature is enabled', () => {
    render(<_Bridge isFeatureEnabled={() => true} />)

    expect(mockRouter.replace).not.toHaveBeenCalled()
  })
})
