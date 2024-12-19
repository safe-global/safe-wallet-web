import { sanitizeUrl } from '../url'

describe('sanitizeUrl', () => {
  it('does not alter http URLs with alphanumeric characters', () => {
    expect(sanitizeUrl('http://example.com/path/to:something')).toBe('http://example.com/path/to:something')
  })

  it('does not alter http URLs with ports with alphanumeric characters', () => {
    expect(sanitizeUrl('http://example.com:4567/path/to:something')).toBe('http://example.com:4567/path/to:something')
  })

  it('does not alter https URLs with alphanumeric characters', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
  })

  it('does not alter https URLs with ports with alphanumeric characters', () => {
    expect(sanitizeUrl('https://example.com:4567/path/to:something')).toBe('https://example.com:4567/path/to:something')
  })

  it('does not alter relative-path reference URLs with alphanumeric characters', () => {
    expect(sanitizeUrl('./path/to/my.json')).toBe('./path/to/my.json')
  })

  it('does not alter absolute-path reference URLs with alphanumeric characters', () => {
    expect(sanitizeUrl('/path/to/my.json')).toBe('/path/to/my.json')
  })

  it('does not alter protocol-less network-path URLs with alphanumeric characters', () => {
    expect(sanitizeUrl('//google.com/robots.txt')).toBe('//google.com/robots.txt')
  })

  it('does not alter protocol-less URLs with alphanumeric characters', () => {
    expect(sanitizeUrl('www.example.com')).toBe('www.example.com')
  })

  it('does not alter deep-link urls with alphanumeric characters', () => {
    expect(sanitizeUrl('com.braintreepayments.demo://example')).toBe('com.braintreepayments.demo://example')
  })

  it('does not alter mailto urls with alphanumeric characters', () => {
    expect(sanitizeUrl('mailto:test@example.com?subject=hello+world')).toBe(
      'mailto:test@example.com?subject=hello+world',
    )
  })

  it('does not alter urls with accented characters', () => {
    expect(sanitizeUrl('www.example.com/with-áccêntš')).toBe('www.example.com/with-áccêntš')
  })

  it('does not strip harmless unicode characters', () => {
    expect(sanitizeUrl('www.example.com/лот.рфшишкиü–')).toBe('www.example.com/лот.рфшишкиü–')
  })

  it('strips out ctrl chars', () => {
    expect(sanitizeUrl('www.example.com/\u200D\u0000\u001F\x00\x1F\uFEFFfoo')).toBe('www.example.com/foo')
  })

  it('replaces blank urls with an empty space', () => {
    expect(sanitizeUrl('')).toBe('')
  })

  it('removes whitespace from urls', () => {
    expect(sanitizeUrl('   http://example.com/path/to:something    ')).toBe('http://example.com/path/to:something')
  })

  describe('invalid protocols', () => {
    describe.each(['javascript', 'data', 'vbscript'])('%s', (protocol) => {
      it(`replaces ${protocol} urls with an empty space`, () => {
        expect(() => sanitizeUrl(`${protocol}:alert(document.domain)`)).toThrow(/invalid protocol/i)
      })

      it(`allows ${protocol} urls that start with a letter prefix`, () => {
        expect(sanitizeUrl(`not_${protocol}:alert(document.domain)`)).toBe(`not_${protocol}:alert(document.domain)`)
      })

      it(`disallows ${protocol} urls that start with non-\w characters as a suffix for the protocol`, () => {
        expect(() => sanitizeUrl(`&!*${protocol}:alert(document.domain)`)).toThrow(/invalid protocol/i)
      })

      it(`disregards capitalization for ${protocol} urls`, () => {
        // upper case every other letter in protocol name
        const mixedCapitalizationProtocol = protocol
          .split('')
          .map((character, index) => {
            if (index % 2 === 0) {
              return character.toUpperCase()
            }
            return character
          })
          .join('')

        expect(() => sanitizeUrl(`${mixedCapitalizationProtocol}:alert(document.domain)`)).toThrow(/invalid protocol/i)
      })

      it(`ignores invisible ctrl characters in ${protocol} urls`, () => {
        const protocolWithControlCharacters = protocol
          .split('')
          .map((character, index) => {
            if (index === 1) {
              return character + '%EF%BB%BF%EF%BB%BF'
            } else if (index === 2) {
              return character + '%e2%80%8b'
            }
            return character
          })
          .join('')

        expect(() =>
          sanitizeUrl(decodeURIComponent(`${protocolWithControlCharacters}:alert(document.domain)`)),
        ).toThrow(/invalid protocol/i)
      })

      it(`replaces ${protocol} urls with empty space when url begins with %20`, () => {
        expect(() => sanitizeUrl(decodeURIComponent(`%20%20%20%20${protocol}:alert(document.domain)`))).toThrow(
          /invalid protocol/i,
        )
      })

      it(`replaces ${protocol} urls with empty space when ${protocol} url begins with an empty space`, () => {
        expect(() => sanitizeUrl(`    ${protocol}:alert(document.domain)`)).toThrow(/invalid protocol/i)
      })

      it(`does not replace ${protocol}: if it is not in the scheme of the URL`, () => {
        expect(sanitizeUrl(`http://example.com#${protocol}:foo`)).toBe(`http://example.com#${protocol}:foo`)
      })
    })
  })
})
