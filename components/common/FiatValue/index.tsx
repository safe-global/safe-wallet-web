import { ReactElement, useMemo } from 'react'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/sessionSlice'

const FiatValue = ({ value }: { value: string | number }): ReactElement => {
  const currency = useAppSelector(selectCurrency)

  const formatter = useMemo(() => {
    return new Intl.NumberFormat([], { style: 'currency', currency })
  }, [currency])

  return <span suppressHydrationWarning>{formatter.format(Number(value))}</span>
}

export default FiatValue
