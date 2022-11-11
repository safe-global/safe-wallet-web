import { checksumAddress, isChecksummedAddress, parsePrefixedAddress, sameAddress } from '../addresses'

describe('Addresses', () => {
  describe('checksumAddress', () => {
    it('should checksum lowercase addresses', () => {
      const value = checksumAddress('0x62da87ff2e2216f1858603a3db9313e178da3112')
      expect(value).toBe('0x62Da87FF2E2216F1858603A3Db9313E178da3112')
    })

    it('should return checksummed addresses as is', () => {
      const value = checksumAddress('0x62Da87FF2E2216F1858603A3Db9313E178da3112')
      expect(value).toBe('0x62Da87FF2E2216F1858603A3Db9313E178da3112')
    })

    it('should return mixed case addresses as is', () => {
      const value = checksumAddress('0x62Da87ff2E2216F1858603A3Db9313E178da3112')
      expect(value).toBe('0x62Da87ff2E2216F1858603A3Db9313E178da3112')
    })

    it('should return uppercase addresses as is', () => {
      const value = checksumAddress('0X62DA87FF2E2216F1858603A3DB9313E178DA3112')
      expect(value).toBe('0X62DA87FF2E2216F1858603A3DB9313E178DA3112')
    })

    it('should return non-addresses as is', () => {
      const value = checksumAddress('sdfgsdfg')
      expect(value).toBe('sdfgsdfg')
    })
  })

  describe('isChecksummedAddress', () => {
    it('should return true for checksummed addresses', () => {
      const value = isChecksummedAddress('0x62Da87FF2E2216F1858603A3Db9313E178da3112')
      expect(value).toBe(true)
    })

    it('should return false for lowercase addresses', () => {
      const value = isChecksummedAddress('0x62da87ff2e2216f1858603a3db9313e178da3112')
      expect(value).toBe(false)
    })

    it('should return false for mixed case addresses', () => {
      const value = isChecksummedAddress('0x62Da87ff2E2216F1858603A3Db9313E178da3112')
      expect(value).toBe(false)
    })

    it('should return false for uppercase addresses', () => {
      const value = isChecksummedAddress('0X62DA87FF2E2216F1858603A3DB9313E178DA3112')
      expect(value).toBe(false)
    })

    it('should return false for non-/invalid addresses', () => {
      const value = isChecksummedAddress('sdfgsdfg')
      expect(value).toBe(false)
    })
  })

  describe('sameAddress', () => {
    it('returns false if the first or second address is undefined', () => {
      const address = '0x62Da87FF2E2216F1858603A3Db9313E178da3112'
      expect(sameAddress(undefined, address)).toBe(false)
      expect(sameAddress(address, undefined)).toBe(false)
    })

    it('returns false if the addresses are different', () => {
      const address1 = '0x62Da87FF2E2216F1858603A3Db9313E178da3112'
      const address2 = '0x62Da87FF2E2216F1858603A3Db9313E178da3113'
      expect(sameAddress(address1, address2)).toBe(false)
    })

    it('returns true if the addresses are the same', () => {
      const address = '0x62Da87FF2E2216F1858603A3Db9313E178da3112'
      expect(sameAddress(address, address)).toBe(true)
    })
  })

  describe('parsePrefixedAddress', () => {
    it('should parse a prefixed address', () => {
      const { prefix, address } = parsePrefixedAddress('prefix:0x62Da87FF2E2216F1858603A3Db9313E178da3112')
      expect(prefix).toBe('prefix')
      expect(address).toBe('0x62Da87FF2E2216F1858603A3Db9313E178da3112')
    })

    it('should parse a non-prefixed address', () => {
      const { prefix, address } = parsePrefixedAddress('0x62Da87FF2E2216F1858603A3Db9313E178da3112')
      expect(prefix).toBeUndefined()
      expect(address).toBe('0x62Da87FF2E2216F1858603A3Db9313E178da3112')
    })

    it('should checksum addresses', () => {
      const { prefix, address } = parsePrefixedAddress('0x62da87ff2e2216f1858603a3db9313e178da3112')
      expect(prefix).toBeUndefined()
      expect(address).toBe('0x62Da87FF2E2216F1858603A3Db9313E178da3112')
    })

    it('should parse a non-addresses', () => {
      const { prefix, address } = parsePrefixedAddress('sdfgsdfg')
      expect(prefix).toBeUndefined()
      expect(address).toBe('sdfgsdfg')
    })
  })
})
