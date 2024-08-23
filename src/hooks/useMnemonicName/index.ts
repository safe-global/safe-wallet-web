import { useMemo } from 'react'
import { animalsDict, adjectivesDict } from './dict'

const animals: string[] = animalsDict.trim().split(/\s+/)
const adjectives: string[] = adjectivesDict.trim().split(/\s+/)

export const capitalize = (word: string) => (word.length > 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word)

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(arr.length * Math.random())]
}

export const getRandomAdjective = () => {
  return capitalize(getRandomItem<string>(adjectives))
}

export const getRandomName = (): string => {
  const adj = capitalize(getRandomItem<string>(adjectives))
  return `${adj} Safe`
}

export const useMnemonicSafeName = (noun?: string): string => {
  return useMemo(() => getRandomName(), [])
}

// export const useMnemonicSafeName = (): string => {
//   return useMnemonicName(` Safe`)
// }
