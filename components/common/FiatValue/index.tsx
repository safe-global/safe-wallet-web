import { ReactElement, useMemo } from 'react'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/currencySlice'

const FiatValue = ({ value }: { value: string | number }): ReactElement => {
  const { selectedCurrency } = useAppSelector(selectCurrency)

  const formatter = useMemo(() => {
    return new Intl.NumberFormat([], { style: 'currency', currency: selectedCurrency })
  }, [selectedCurrency])

  return <span suppressHydrationWarning>{formatter.format(Number(value))}</span>
}

export default FiatValue
