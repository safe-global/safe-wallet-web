import { render, waitFor, screen } from '@/tests/test-utils'
import madProps from '../mad-props'

describe('madProps', () => {
  it('should map a set of props to hooks', async () => {
    const Component = ({ foo, bar }: { foo: string; bar: string }) => <>{foo + bar}</>

    const MappedComponent = madProps(Component, {
      foo: () => 'foo',
      bar: () => 'bar',
    })

    render(<MappedComponent />)

    await waitFor(() => {
      expect(screen.getByText('foobar')).toBeInTheDocument()
    })
  })

  it('should accept additional props', async () => {
    const Component = ({ foo, bar, baz }: { foo: string; bar: string; baz: string }) => <>{foo + bar + baz}</>

    const MappedComponent = madProps(Component, {
      foo: () => 'foo',
      bar: () => 'bar',
    })

    render(<MappedComponent baz="baz" />)

    await waitFor(() => {
      expect(screen.getByText('foobarbaz')).toBeInTheDocument()
    })
  })
})
