import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store'
import { fetchCurrencies, selectCurrency } from '@/store/currencySlice'

export const useInitCurriencies = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let isCurrent = true

    if (isCurrent) {
      dispatch(fetchCurrencies())
    }

    return () => {
      isCurrent = false
    }
  }, [dispatch])
}

const useCurrencies = () => {
  const currency = useAppSelector(selectCurrency)
  return currency
}

export default useCurrencies
