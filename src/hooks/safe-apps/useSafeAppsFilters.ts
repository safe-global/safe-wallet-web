import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

import { useAppsFilterByCategory } from './useAppsFilterByCategory'
import { useAppsSearch } from './useAppsSearch'

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [optimizedWithBatchFilter, setOptimizedWithBatchFilter] = useState<boolean>(false)

  const filteredAppsByQuery = useAppsSearch(safeAppsList, query)

  const filteredAppsByQueryAndCategories = useAppsFilterByCategory(filteredAppsByQuery, selectedCategories)

  // TODO: Implement optimized with Batch
  const filteredApps = optimizedWithBatchFilter ? [] : filteredAppsByQueryAndCategories

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
