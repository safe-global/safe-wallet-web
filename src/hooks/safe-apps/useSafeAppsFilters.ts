import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

import { useAppsFilterByCategory } from './useAppsFilterByCategory'
import { useAppsSearch } from './useAppsSearch'
import { useAppsFilterByOptimizedForBatch } from './useAppsFilterByOptimizedForBatch'
import useDebounce from '../useDebounce'
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@/services/analytics'

type ReturnType = {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  selectedCategories: string[]
  setSelectedCategories: Dispatch<SetStateAction<string[]>>
  optimizedWithBatchFilter: boolean
  setOptimizedWithBatchFilter: Dispatch<SetStateAction<boolean>>
  filteredApps: SafeAppData[]
}

const useSafeAppsFilters = (safeAppsList: SafeAppData[]): ReturnType => {
  const [query, setQuery] = useState<string>('')
  const debouncedQuery = useDebounce(query, 400)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [optimizedWithBatchFilter, setOptimizedWithBatchFilter] = useState<boolean>(false)

  const filteredAppsByQuery = useAppsSearch(safeAppsList, debouncedQuery)

  const filteredAppsByQueryAndCategories = useAppsFilterByCategory(filteredAppsByQuery, selectedCategories)

  const filteredApps = useAppsFilterByOptimizedForBatch(filteredAppsByQueryAndCategories, optimizedWithBatchFilter)

  const debouncedSearchQuery = useDebounce(query, 2000)

  useEffect(() => {
    if (debouncedSearchQuery) {
      trackSafeAppEvent({ ...SAFE_APPS_EVENTS.SEARCH, label: debouncedSearchQuery })
    }
  }, [debouncedSearchQuery])

  return {
    query,
    setQuery,

    selectedCategories,
    setSelectedCategories,

    optimizedWithBatchFilter,
    setOptimizedWithBatchFilter,

    filteredApps,
  }
}

export default useSafeAppsFilters
