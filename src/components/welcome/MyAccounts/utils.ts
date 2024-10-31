import type { SafeItem } from './useAllSafes'
import type { MultiChainSafeItem } from './useAllSafesGrouped'

export enum SortBy {
  NAME = 'name',
  LAST_VISITED = 'lastVisited',
  DEFAULT = 'default',
}

export const nameComparator = (a: SafeItem | MultiChainSafeItem, b: SafeItem | MultiChainSafeItem) => {
  // Put undefined names last
  if (!a.name && !b.name) return 0
  if (!a.name) return 1
  if (!b.name) return -1
  return a.name.localeCompare(b.name)
}

export const lastVisitedComparator = (a: SafeItem | MultiChainSafeItem, b: SafeItem | MultiChainSafeItem) => {
  return (b.lastVisited ?? 0) - (a.lastVisited ?? 0)
}

export const getComparator = (sortBy: SortBy) => {
  return sortBy === SortBy.NAME ? nameComparator : lastVisitedComparator
}
