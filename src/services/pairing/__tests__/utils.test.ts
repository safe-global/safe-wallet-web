import { addDays } from 'date-fns'
import type { IWalletConnectSession } from '@walletconnect/types'

import { formatPairingUri, isPairingSupported, hasValidPairingSession, _isPairingSessionExpired } from '../utils'

describe('Pairing utils', () => {
  describe('formatPairingUri', () => {
    it('should return a prefixed URI', () => {
      const uri = 'wc:1-2@1?bridge=https://test.com/&key=1234'

      const result = formatPairingUri(uri)
      expect(result).toBe('safe-wc:1-2@1?bridge=https://test.com/&key=1234')
    })

    it('should return undefined if no URI exists', () => {
      const result = formatPairingUri('')
      expect(result).toBeUndefined()
    })

    it("should return undefined if the URI doesn't end with a key", () => {
      const uri = 'wc:1-2@1?bridge=https://test.com/&key='

      const result = formatPairingUri(uri)
      expect(result).toBeUndefined()
    })
  })

  describe('isPairingSupported', () => {
    it('should return true if the wallet is enabled', () => {
      const result = isPairingSupported(['walletConnect'])
      expect(result).toBe(true)
    })

    it('should return false if the wallet is disabled', () => {
      const result1 = isPairingSupported([])
      expect(result1).toBe(false)

      const result2 = isPairingSupported(['safeMobile'])
      expect(result2).toBe(false)
    })
  })

  describe('isPairingSessionExpired', () => {
    it('should return true if the session is older than 24h', () => {
      const session: Pick<IWalletConnectSession, 'handshakeId'> = {
        handshakeId: 1000000000000123,
      }

      expect(_isPairingSessionExpired(session as IWalletConnectSession)).toBe(true)
    })

    it('should return false if the session is within the last 24h', () => {
      const session: Pick<IWalletConnectSession, 'handshakeId'> = {
        handshakeId: +`${Date.now()}123`,
      }

      expect(_isPairingSessionExpired(session as IWalletConnectSession)).toBe(false)
    })
  })

  describe('hasValidPairingSession', () => {
    beforeEach(() => {
      window.localStorage.clear()
    })

    it('should return false if there is no cached session', () => {
      expect(hasValidPairingSession()).toBe(false)
    })

    it('should return true if the cached session date is within the last 24h', () => {
      const session: Pick<IWalletConnectSession, 'handshakeId'> = {
        handshakeId: 1000000000000123,
      }

      window.localStorage.setItem('SAFE_v2__pairingConnector', JSON.stringify(session))

      jest.spyOn(Date, 'now').mockImplementation(() => +session.handshakeId.toString().slice(0, -3) + 1)

      expect(hasValidPairingSession()).toBe(true)
    })

    it('should return false and clear the cache if the cached session date is older than 24h', () => {
      const session: Pick<IWalletConnectSession, 'handshakeId'> = {
        handshakeId: 1000000000000123,
      }

      window.localStorage.setItem('SAFE_v2__pairingConnector', JSON.stringify(session))

      const sessionTimestamp = session.handshakeId.toString().slice(0, -3)
      const expirationDate = addDays(new Date(+sessionTimestamp), 1)

      jest.spyOn(Date, 'now').mockImplementation(() => expirationDate.getTime() + 1)

      expect(hasValidPairingSession()).toBe(false)

      expect(window.localStorage.getItem('SAFE_v2__pairingConnector')).toBeNull()
    })
  })
})
