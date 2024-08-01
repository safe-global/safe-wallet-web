import type { CSSProperties, ReactElement } from 'react'
import { useMemo } from 'react'
import { Tooltip } from '@mui/material'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/settingsSlice'
import { formatCurrency, formatCurrencyPrecise } from '@/utils/formatNumber'

const style = { whiteSpace: 'nowrap' } as CSSProperties

const FiatValue = ({ value, maxLength }: { value: string | number; maxLength?: number }): ReactElement => {
  const currency = useAppSelector(selectCurrency)

  const fiat = useMemo(() => {
    return formatCurrency(value, currency, maxLength)
  }, [value, currency, maxLength])

  const preciseFiat = useMemo(() => {
    return formatCurrencyPrecise(value, currency)
  }, [value, currency])

  return (
    <Tooltip title={preciseFiat}>
      <span suppressHydrationWarning style={style}>
        {fiat}
      </span>
    </Tooltip>
  )
}

export default FiatValue
