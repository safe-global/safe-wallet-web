import { ConnectionCenter } from '@/components/common/ConnectWallet/ConnectionCenter'
import { render } from '@/tests/test-utils'

describe('ConnectionCenter', () => {
  it('displays a Connect wallet button if the social login feature is enabled', () => {
    const { getByText, queryByText } = render(<ConnectionCenter isSocialLoginEnabled={true} />)

    expect(getByText('Connect wallet')).toBeInTheDocument()
    expect(queryByText('Connect')).not.toBeInTheDocument()
  })

  it('displays the ConnectWalletButton if the social login feature is disabled', () => {
    const { getByText, queryByText } = render(<ConnectionCenter isSocialLoginEnabled={false} />)

    expect(queryByText('Connect wallet')).not.toBeInTheDocument()
    expect(getByText('Connect')).toBeInTheDocument()
  })
})
