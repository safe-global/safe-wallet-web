import { ReactElement, useMemo } from 'react'
import useBrowserLocale from '@/services/useBrowserLocale'
import { useAppSelector } from 'store'
import { selectCurrency } from '@/store/currencySlice'

const FiatValue = ({ value }: { value: string | number }): ReactElement => {
  const locale = useBrowserLocale()
  const currency = useAppSelector(selectCurrency)

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency })
  }, [currency, locale])

  return <>{formatter.format(Number(value))}</>
}

export default FiatValue
