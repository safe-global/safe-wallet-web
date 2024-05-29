import SettingsHeader from '@/components/settings/SettingsHeader/index'
import * as safeAddress from '@/hooks/useSafeAddress'
import * as feature from '@/hooks/useChains'

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
  })
})
