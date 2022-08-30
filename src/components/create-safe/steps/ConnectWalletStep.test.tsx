import { render } from '@/tests/test-utils'
import { ConnectWalletContent } from '@/components/create-safe/steps/ConnectWalletStep'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { type EIP1193Provider } from '@web3-onboard/core'

describe('ConnectWalletContent', () => {
  describe('Wallet is not connected', () => {
    it('displays a button to connect the wallet', () => {
      const { getByText } = render(<ConnectWalletContent wallet={null} isWrongChain={false} />)

      expect(getByText('Connect a wallet')).toBeInTheDocument()
    })
  })

  describe('Wallet is connected', () => {
    let mockWallet: ConnectedWallet

    beforeAll(() => {
      mockWallet = {
        address: '',
        chainId: '',
        label: '',
        provider: null as unknown as EIP1193Provider,
      }
    })

    it('displays a chain indicator', () => {
      const { getByText } = render(<ConnectWalletContent wallet={mockWallet} isWrongChain={false} />)

      expect(getByText('Creating a Safe on')).toBeInTheDocument()
    })

    it('displays a wallet connected message if on the correct chain', () => {
      const { getByText } = render(<ConnectWalletContent wallet={mockWallet} isWrongChain={false} />)

      expect(getByText('Wallet connected')).toBeInTheDocument()
    })

    it('displays a message if on the wrong chain', () => {
      const { getByText } = render(<ConnectWalletContent wallet={mockWallet} isWrongChain={true} />)

      expect(getByText('Your wallet connection must match the selected network.')).toBeInTheDocument()
    })
  })
})
