import { ReactElement, useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'store'
import { selectCurrency } from 'store/currencySlice'

const FiatValue = ({ value }: { value: string | number }): ReactElement => {
  const [locale, setLocale] = useState<string>('en-US')
  const currency = useAppSelector(selectCurrency)

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency })
  }, [currency, locale])

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.language) {
      setLocale(navigator.language)
    }
  }, [])

  return <>{formatter.format(Number(value))}</>
}

export default FiatValue
