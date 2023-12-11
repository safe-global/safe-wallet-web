import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { render } from '@/tests/test-utils'
import { NetworkFee } from '@/components/new-safe/create/steps/ReviewStep/index'
import * as useWallet from '@/hooks/wallets/useWallet'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'

const mockChainInfo = {
  chainId: '100',
  chainName: 'Gnosis Chain',
  l2: false,
  nativeCurrency: {
    symbol: 'ETH',
  },
} as ChainInfo

describe('NetworkFee', () => {
  it('should display the total fee if not social login', () => {
    jest.spyOn(useWallet, 'default').mockReturnValue({ label: 'MetaMask' } as unknown as ConnectedWallet)
    const mockTotalFee = '0.0123'
    const result = render(<NetworkFee totalFee={mockTotalFee} chain={mockChainInfo} willRelay={true} />)

    expect(result.getByText(`≈ ${mockTotalFee} ${mockChainInfo.nativeCurrency.symbol}`)).toBeInTheDocument()
  })

  it('displays a sponsored by message for social login', () => {
    jest.spyOn(useWallet, 'default').mockReturnValue({ label: ONBOARD_MPC_MODULE_LABEL } as unknown as ConnectedWallet)
    const result = render(<NetworkFee totalFee="0" chain={mockChainInfo} willRelay={true} />)

    expect(result.getByText(/Your account is sponsored by Gnosis/)).toBeInTheDocument()
  })

  it('displays an error message for social login if there are no relays left', () => {
    jest.spyOn(useWallet, 'default').mockReturnValue({ label: ONBOARD_MPC_MODULE_LABEL } as unknown as ConnectedWallet)
    const result = render(<NetworkFee totalFee="0" chain={mockChainInfo} willRelay={false} />)

    expect(
      result.getByText(/You have used up your 5 free transactions per hour. Please try again later/),
    ).toBeInTheDocument()
  })
})
