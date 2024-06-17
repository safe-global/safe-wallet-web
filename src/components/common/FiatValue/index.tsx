import type { CSSProperties, ReactElement } from 'react'
import { useMemo } from 'react'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/settingsSlice'
import { formatCurrency } from '@/utils/formatNumber'

const style = { whiteSpace: 'nowrap' } as CSSProperties

const FiatValue = ({ value, maxLength }: { value: string | number; maxLength?: number }): ReactElement => {
  const currency = useAppSelector(selectCurrency)

  const fiat = useMemo(() => {
    return formatCurrency(value, currency, maxLength)
  }, [value, currency, maxLength])

  return (
    <span suppressHydrationWarning style={style}>
      {fiat}
    </span>
  )
}

export default FiatValue
