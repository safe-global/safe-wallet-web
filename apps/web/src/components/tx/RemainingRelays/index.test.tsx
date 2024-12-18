import { render } from '@/tests/test-utils'
import RemainingRelays from '.'

describe('RemainingRelays', () => {
  it('should display full remaining relays', async () => {
    const result = render(
      <RemainingRelays
        relays={{
          limit: 5,
          remaining: 5,
        }}
      />,
    )

    await expect(result.findByText('5')).resolves.not.toBeNull()
  })

  it('should display full remaining relays if remaining undefined', async () => {
    const result = render(<RemainingRelays relays={undefined} />)

    await expect(result.findByText('5')).resolves.not.toBeNull()
  })

  it('should display zero remaining relays', async () => {
    const result = render(
      <RemainingRelays
        relays={{
          limit: 5,
          remaining: 0,
        }}
      />,
    )

    await expect(result.findByText('0')).resolves.not.toBeNull()
  })
})
