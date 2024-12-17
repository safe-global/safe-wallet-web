import { render } from '@/src/tests/test-utils'
import { ParticlesLogo } from './ParticlesLogo'

describe('ParticlesLogo', () => {
  it('should render default markup', () => {
    const container = render(<ParticlesLogo />)

    expect(container).toMatchSnapshot()
  })
})
