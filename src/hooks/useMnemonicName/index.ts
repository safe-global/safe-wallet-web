import { useMemo } from 'react'
import { useCurrentChain } from '@/hooks/useChains'
import { animalsDict, adjectivesDict } from './dict'

const animals: string[] = animalsDict.trim().split(/\s+/)
const adjectives: string[] = adjectivesDict.trim().split(/\s+/)

export const capitalize = (word: string) => (word.length > 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word)

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(arr.length * Math.random())]
}

export const getRandomName = (noun = capitalize(getRandomItem<string>(animals))): string => {
  const adj = capitalize(getRandomItem<string>(adjectives))
  return `${adj} ${noun}`
}

export const useMnemonicName = (noun?: string): string => {
  return useMemo(() => getRandomName(noun), [noun])
}

export const useMnemonicSafeName = (): string => {
  const networkName = useCurrentChain()?.chainName
  return useMnemonicName(`${networkName} Safe`)
}
