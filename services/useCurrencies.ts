import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store'
import { fetchCurrencies, selectCurrency } from '@/store/currencySlice'

export const useInitCurriencies = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCurrencies())
  }, [dispatch])
}

const useCurrencies = () => {
  const currency = useAppSelector(selectCurrency)
  return currency
}

export default useCurrencies
