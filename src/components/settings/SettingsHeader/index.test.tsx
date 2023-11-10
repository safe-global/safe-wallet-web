import SettingsHeader from '@/components/settings/SettingsHeader/index'
import * as safeAddress from '@/hooks/useSafeAddress'
import * as feature from '@/hooks/useChains'
import * as wallet from '@/hooks/wallets/useWallet'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import { connectedWalletBuilder } from '@/tests/builders/wallet'

import { render } from '@/tests/test-utils'
import { faker } from '@faker-js/faker'

describe('SettingsHeader', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('A safe is open', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.spyOn(safeAddress, 'default').mockReturnValue(faker.finance.ethereumAddress())
    })

    it('displays safe specific preferences if on a safe', () => {
      const result = render(<SettingsHeader />)

      expect(result.getByText('Setup')).toBeInTheDocument()
    })

    it('displays Notifications if feature is enabled', () => {
      jest.spyOn(feature, 'useHasFeature').mockReturnValue(true)

      const result = render(<SettingsHeader />)

      expect(result.getByText('Notifications')).toBeInTheDocument()
    })

    it('displays Security & Login if connected wallet is a social signer', () => {
      const mockWallet = connectedWalletBuilder().with({ label: ONBOARD_MPC_MODULE_LABEL }).build()
      jest.spyOn(wallet, 'default').mockReturnValue(mockWallet)

      const result = render(<SettingsHeader />)

      expect(result.getByText('Security & Login')).toBeInTheDocument()
    })
  })

  describe('No safe is open', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.spyOn(safeAddress, 'default').mockReturnValue('')
    })

    it('displays general preferences if no safe is open', () => {
      const result = render(<SettingsHeader />)

      expect(result.getByText('Cookies')).toBeInTheDocument()
      expect(result.getByText('Appearance')).toBeInTheDocument()
      expect(result.getByText('Data')).toBeInTheDocument()
      expect(result.getByText('Environment variables')).toBeInTheDocument()
    })

    it('displays Notifications if feature is enabled', () => {
      jest.spyOn(feature, 'useHasFeature').mockReturnValue(true)

      const result = render(<SettingsHeader />)

      expect(result.getByText('Notifications')).toBeInTheDocument()
    })

    it('displays Security & Login if connected wallet is a social signer', () => {
      const mockWallet = connectedWalletBuilder().with({ label: ONBOARD_MPC_MODULE_LABEL }).build()
      jest.spyOn(wallet, 'default').mockReturnValue(mockWallet)

      const result = render(<SettingsHeader />)

      expect(result.getByText('Security & Login')).toBeInTheDocument()
    })
  })
})
