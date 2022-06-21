import { useMemo, type ReactElement } from 'react'

import useBalances from '@/services/useBalances'
import { Typography } from '@mui/material'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/sessionSlice'
import React from 'react'

const SidebarFiat = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const { balances } = useBalances()

  // TODO: Extract when implementing formatter functions
  const { wholeNumber, decimalSeparator, decimals } = useMemo(() => {
    // Intl.NumberFormat always returns the currency code or symbol so we must manually remove it
    const formatter = new Intl.NumberFormat([], { style: 'currency', currency })

    const parts = formatter.formatToParts(Number(balances.fiatTotal))

    const wholeNumber = parts.find(({ type }) => type === 'integer')?.value || 0
    const decimalSeparator = parts.find(({ type }) => type === 'decimal')?.value || ''
    const decimals = parts.find(({ type }) => type === 'fraction')?.value || ''

    return { wholeNumber, decimalSeparator, decimals }
  }, [currency, balances.fiatTotal])

  return (
    <>
      <Typography variant="body1" display="inline">
        {wholeNumber}
      </Typography>
      <Typography variant="body1" display="inline" sx={({ palette }) => ({ color: palette.secondaryBlack[300] })}>
        {
          // Some currencies don't have decimals
          decimalSeparator && decimals ? `${decimalSeparator}${decimals}` : ''
        }{' '}
        {currency.toUpperCase()}
      </Typography>
    </>
  )
}

export default React.memo(SidebarFiat)
