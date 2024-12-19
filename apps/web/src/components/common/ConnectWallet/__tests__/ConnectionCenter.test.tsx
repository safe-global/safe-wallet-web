import ConnectionCenter from '@/components/common/ConnectWallet/ConnectionCenter'
import { render } from '@/tests/test-utils'

describe('ConnectionCenter', () => {
  it('displays the ConnectWalletButton', () => {
    const { getByText, queryByText } = render(<ConnectionCenter />)

    expect(queryByText('Connect wallet')).not.toBeInTheDocument()
    expect(getByText('Connect')).toBeInTheDocument()
  })
})
