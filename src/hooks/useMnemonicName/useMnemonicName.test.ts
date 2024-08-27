import { capitalize, getRandomName, useMnemonicSafeName } from '.'
import { renderHook } from '@/tests/test-utils'
import { chainBuilder } from '@/tests/builders/chains'

const mockChain = chainBuilder().build()

// Mock useCurrentChain hook
jest.mock('@/hooks/useChains', () => ({
  useCurrentChain: () => mockChain,
}))

describe('useMnemonicName tests', () => {
  it('should capitalize a word', () => {
    expect(capitalize('word')).toEqual('Word')
  })

  it('should generate a random name', () => {
    expect(getRandomName()).toMatch(/^[A-Z][a-z-]+ [A-Z][a-z]+$/)
    expect(getRandomName()).toMatch(/^[A-Z][a-z-]+ [A-Z][a-z]+$/)
    expect(getRandomName()).toMatch(/^[A-Z][a-z-]+ [A-Z][a-z]+$/)
  })

  it('should return a random safe name', () => {
    const { result } = renderHook(() => useMnemonicSafeName())
    const regex = new RegExp(`^[A-Z][a-z-]+ Safe$`)
    expect(result.current).toMatch(regex)
  })
})
