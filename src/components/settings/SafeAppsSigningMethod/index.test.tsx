import { fireEvent, render } from '@/tests/test-utils'
import { SafeAppsSigningMethod } from '.'

describe('SafeAppsSigningMethod', () => {
  it('Toggle on-chain signing', async () => {
    const result = render(<SafeAppsSigningMethod />, {
      initialReduxState: {
        settings: {
          signing: {
            useOnChainSigning: false,
          },
        } as any,
      },
    })

    const checkbox = result.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)

    expect(checkbox).not.toBeChecked()
  })
})
