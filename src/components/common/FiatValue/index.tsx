import type { CSSProperties, ReactElement } from 'react'
import { useMemo } from 'react'
import { Tooltip, Typography } from '@mui/material'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/settingsSlice'
import { formatCurrency, formatCurrencyPrecise } from '@/utils/formatNumber'

const style = { whiteSpace: 'nowrap' } as CSSProperties

const getStyle = (safenet: boolean) => ({
  ...style,
  ...(safenet
    ? {
        borderRadius: '40px',
        background: 'rgba(238, 213, 9, 0.15)',
        padding: 'calc(var(--space-1) / 2) var(--space-1)',
      }
    : {}),
})

const FiatValue = ({
  value,
  maxLength,
  precise,
  safenet = false,
}: {
  value: string | number
  maxLength?: number
  precise?: boolean
  safenet?: boolean
}): ReactElement => {
  const currency = useAppSelector(selectCurrency)

  const fiat = useMemo(() => {
    return formatCurrency(value, currency, maxLength)
  }, [value, currency, maxLength])

  const preciseFiat = useMemo(() => {
    return formatCurrencyPrecise(value, currency)
  }, [value, currency])

  const [whole, decimals, endCurrency] = useMemo(() => {
    const match = preciseFiat.match(/(.+)(\D\d+)(\D+)?$/)
    return match ? match.slice(1) : ['', preciseFiat, '', '']
  }, [preciseFiat])

  return (
    <Tooltip title={precise ? undefined : preciseFiat}>
      <span suppressHydrationWarning style={getStyle(safenet)}>
        {precise ? (
          <>
            {whole}
            {decimals && (
              <Typography component="span" color="text.secondary" fontSize="inherit" fontWeight="inherit">
                {decimals}
              </Typography>
            )}
            {endCurrency}
          </>
        ) : (
          fiat
        )}
      </span>
    </Tooltip>
  )
}

export default FiatValue
