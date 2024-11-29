import { render } from '@testing-library/react'
import type { NextRouter } from 'next/router'

import { Navigate } from '@/components/common/Navigate'

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
} as jest.MockedObjectDeep<NextRouter>

describe('Navigate', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter)
  })

  it('should navigate to the specified route', () => {
    render(<Navigate to="/test" />)

    expect(mockRouter.push).toHaveBeenCalledWith('/test')
  })

  it('should replace the current route', () => {
    render(<Navigate to="/test" replace />)

    expect(mockRouter.replace).toHaveBeenCalledWith('/test')
  })
})
