import { render } from '@testing-library/react'
import { FallbackHandlerVersion } from '..'

const renderFallbackHandler = () => render(<FallbackHandlerVersion isGranted={true} />)

describe('FallbackHandlerVersion', () => {
  it('should not render anything for unsupported safe versions', () => {
    // TODO
  })

  it('should show set fallback handler button for empty fallback handlers', () => {
    //TODO
  })

  it('should show name of fallback handler if known', () => {
    // TODO
  })
})
